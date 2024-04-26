import { ExecutionsClient } from '@google-cloud/workflows';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { verifyIdToken } from '../auth/controller/authController';


const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post('/quote', async (req: Request, res: Response) => {
  //verification of current user
  const token = req.headers['token-id'];
  const verificationRes = await verifyIdToken(token as string);
  if (!verificationRes.success) return res.status(403).send(verificationRes.value);
  
  if (!req.body) {
    return res.status(400).send('No request body found');
  }


  const projectId = 'ramnetquote';
  const location = 'europe-west2';
  const workflowName = 'QuoteGenerationProcess';
  const executionsClient = new ExecutionsClient();

  try {
    let workflowHeader = req.headers;
    workflowHeader.tenantId = workflowHeader['tenant-id'];
    workflowHeader.tokenId = workflowHeader['token-id'];
    //delete workflowHeader["tenant-id"];

    const argument = JSON.stringify(
      {
        header: workflowHeader,
        body: req.body
      })
    const [execution] = await executionsClient.createExecution({
      parent: executionsClient.workflowPath(projectId, location, workflowName),
      execution: {
        argument: argument
      }
    });

    let executionFinished = false;
    let result = null;
    const backoffDelay = 100;
    let overallTime = 0;
    //skonci ak cas dopytu je vacsi ako 20 sekund
    while (!executionFinished || overallTime < 20000) {
      const [executionResult] = await executionsClient.getExecution({
        name: execution.name,
      });

      executionFinished = executionResult.state !== 'ACTIVE';

      // If we haven't seen the result yet, wait a second.
      if (!executionFinished) {
        await new Promise(resolve => {
          setTimeout(resolve, backoffDelay);
          overallTime += backoffDelay;
        });
      } else {
        // Remove the outer double quotes
        result = executionResult.result?.slice(1, -1);
        break;
      }
    }

    if (!executionFinished) {
      return res.status(500).send("Request time for workflow is over.");
    }
    // Return the result in the response
    return res.status(200).send({ id: result });

  } catch (err: any) {
    return res.status(500).send(err.stack);
  }
});

app.post('/email', async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).send('No request body found');
  }
  //verification of current user
  const token = req.headers['token-id'];
  const verificationRes = await verifyIdToken(token as string);
  if (!verificationRes.success) return res.status(403).send("Access Forbidden.");


  const projectId = 'ramnetquote';
  const location = 'europe-west2';
  const workflowName = 'EmailGenerationProcess';
  const executionsClient = new ExecutionsClient();

  try {
    let workflowHeader = req.headers;
    const quoteId: string = req.body.quoteId
    workflowHeader.tenantId = workflowHeader['tenant-id'];
    workflowHeader.tokenId = workflowHeader['token-id'];
    //delete workflowHeader["tenant-id"];

    const argument = JSON.stringify(
      {
        header: workflowHeader,
        body: {
          quoteId: quoteId
        }
      })
    const [execution] = await executionsClient.createExecution({
      parent: executionsClient.workflowPath(projectId, location, workflowName),
      execution: {
        argument: argument
      }
    });

    let executionFinished = false;
    let result = null;
    const backoffDelay = 100;
    let overallTime = 0;
    //skonci ak cas dopytu je vacsi ako 20 sekund
    while (!executionFinished || overallTime < 20000) {
      const [executionResult] = await executionsClient.getExecution({
        name: execution.name,
      });
      executionFinished = executionResult.state !== 'ACTIVE';

      // If we haven't seen the result yet, wait a second.
      if (!executionFinished) {
        await new Promise(resolve => {
          setTimeout(resolve, backoffDelay);
          overallTime += backoffDelay;
        });
      } else {
        result = executionResult.result;
        break;
      }
    }
    // Return the result in the response
    return res.status(200).send(result);

  } catch (err: any) {
    return res.status(500).send(err.stack);
  }
});



export { app as Workflow };

