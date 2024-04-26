import {Invoice} from './invoice';
export function generateHeader(doc: PDFKit.PDFDocument) {
    doc
        //.image("logo.png", 50, 45, { width: 200 })
        .fillColor("#444444")
        .fontSize(10)
        .text("RAMcom, s.r.o.", 200, 50, { align: "right" })
        .text("je certifikovaná inštalátorská spoločnosť", 200, 65, { align: "right" })
        .text("firmy JABLOTRON ALARMS a.s.", 200, 80, { align: "right" })
        .moveDown();
}

export function generateCustomerInformation(doc: PDFKit.PDFDocument, invoice: Invoice) {
    doc
        .fillColor("#444444")
        //.font('Cardo')
        .fontSize(16)
        .text("NÁVRH ZABEZPEČOVACIEHO SYSTÉMU", 150, 130)
        .fontSize(10)
        .text("variant nr.1", 250, 160);

    generateHr(doc, 110);
    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
        //.font("Cardo-Bold")
        .text("Dodávateľ", 50, customerInformationTop)
        ////.font("Cardo")
        .text(invoice.supplier.name, 50, customerInformationTop + 15)
        .text(invoice.supplier.phone, 50, customerInformationTop + 30)
        .text(invoice.supplier.email, 50, customerInformationTop + 45)
        .text(invoice.supplier.company_name, 50, customerInformationTop + 60)
        .text(invoice.supplier.company, 50, customerInformationTop + 75)
        .text(invoice.supplier.VAT, 50, customerInformationTop + 90)
        .text(invoice.supplier.address, 50, customerInformationTop + 105)
        .text(
            invoice.supplier.city +
            ", " +
            invoice.supplier.country,
            50,
            customerInformationTop + 120
        )
        ////.font("Cardo")
        .text("Ponuka č.", 50, customerInformationTop + 150)
        .text(invoice.invoice_nr, 150, customerInformationTop + 150)
        ////.font("Cardo")
        .text(invoice.supplier.city, 50, customerInformationTop + 165)
        .text(formatDate(new Date()), 150, customerInformationTop + 165)

        ////.font("Cardo-Bold")
        .text("Zákazník", 300, customerInformationTop)
        ////.font("Cardo")
        .text(invoice.shipping.name, 300, customerInformationTop + 15)
        .text(invoice.shipping.phone, 300, customerInformationTop + 30)
        .text(invoice.shipping.email, 300, customerInformationTop + 45)
        .text(invoice.shipping.address, 300, customerInformationTop + 60)
        .text(
            invoice.shipping.city +
            ", " +
            invoice.shipping.country,
            300,
            customerInformationTop + 75
        )
        .moveDown();

    generateHr(doc, 340);
}


export function generateInformation(doc: PDFKit.PDFDocument, invoice: Invoice) {

    const Informations = 400;
    doc
        //.font("Cardo-Bold")
        .text("Vážený/á zákazník/ka,", 50, Informations)
        //.font("Cardo")
        .fontSize(10)
        .text(
            "dovoľte nám, aby sme Vám predstavili našu ponuku služieb, ktorá Vám pomôže zabezpečiť bezpečnosť, ochranu, elektrifikáciu či rozšíriť smart atribút Vášho domova alebo firmy. Naša firma sa špecializuje na montáž a údržbu bezpečnostných systémov, elektroinštalácií, smart riešení pre domácnosti a sme presvedčení, že naša ponuka bude zodpovedať Vašim potrebám.", 50, Informations + 15
        )
        //.font("Cardo-Bold")
        .text("Naša ponuka obsahuje nasledujúce služby:", 50, Informations + 75)
        //.font("Cardo-Bold")
        .text("Instalácia:", 50, Informations + 100)
        //.font("Cardo")
        .text("Naši skúsení technici Vám pomôžu s inštaláciou systému, ktorý je jednoduchý a flexibilný, a umožní Vám ľahko a kedykoľvek rozšíriť ho o ďalšie periférie a funkcie. Po montáži sa samozrejme postaráme aj o poriadne upratanie pracovnej plochy.", 50)

        //.font("Cardo-Bold")
        .text("Zaškolenie:", 50, Informations + 165)
        //.font("Cardo")
        .text("V našej ponuke je aj školenie, ktoré Vám umožní ľahko a správne ovládať systém. Navrhnutá konfigurácia je zrozumiteľná a vysvetlíme Vám všetky jeho funkcie, aby ste ich rýchlo a ľahko pochopili. Okrem toho Vám poskytneme aj odovzdávací protokol, ktorým môžete preukázať odbornú inštaláciu certifikovaného systému.", 50)

        //.font("Cardo-Bold")
        .text("Záruka:", 50, Informations + 230)
        //.font("Cardo")
        .text("Na montáž poskytujeme záruku 2 roky, aby sme Vám zabezpečili úplnú spokojnosť s našimi službami.", 50)

        //.font("Cardo-Bold")
        .text("Servis:", 50, Informations + 265)
        //.font("Cardo")
        .text("Náš tím je k dispozícii pre záručný a pozáručný servis a v prípade potreby Vám poskytneme aj odborné poradenstvo.", 50)
        .text("Dúfame, že naša ponuka Vás zaujala a tešíme sa na spoluprácu s Vami.", 50)
    doc.moveDown(2);
}

export function generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: Invoice) {
    let i;
    const invoiceTableTop = 100; // Zmenená hodnota na 450

    doc//.font("Cardo-Bold");
    generateTableRow(
        doc,
        invoiceTableTop,
        "Položka",
        "Množstvo",
        "Jednotková cena",
        "Jednotka",
        "Celková suma"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc//.font("Cardo");

    let position = invoiceTableTop + 40;

    for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];

        if (position + 30 > doc.page.height - 50) {
            // Stránka sa zaplnila, vytvoríme novú stránku
            doc.addPage();
            doc//.font("Cardo-Bold");
            generateTableRow(
                doc,
                50,
                "Položka",
                "Množstvo",
                "Jednotková cena",
                "Jednotka",
                "Celková suma"
            );
            doc//.font("Cardo");
            generateHr(doc, 70);
            position = 80;
        }
        generateTableRow(
            doc,
            position,
            item.name,
            item.quantity,
            formatCurrency(item.price),
            item.unit,
            formatCurrency(item.totalPrice)
        );

        generateHr(doc, position + 20);
        position += 40;
    }

    const subtotalPosition = position;
    generateTableRow(
        doc,
        subtotalPosition,
        "",
        "",
        "Celková cena bez DPH",
        "",
        formatCurrency(invoice.totalPrice)
    );

    const paidToDatePosition = subtotalPosition + 20;
    generateTableRow(
        doc,
        paidToDatePosition,
        "",
        "",
        "Celková cena s DPH",
        "",
        formatCurrency(invoice.totalPriceWithVat)
    );
    
}

export function generateEnd(doc: PDFKit.PDFDocument) {
    doc
        //.font("Cardo-Bold")
        .text("Záver:", 50)
        //.font("Cardo")
        .fontSize(10)
        .text(
            "Odporúčame vám prijať taký variant návrhu, ktorý svojim rozsahom najviac pokrýva požiadavky na ochranu vášho objektu a súvisiace podružné funkcie. Využitím všetkých vlastností systému dosiahnete optimálny pomer úžitkovej hodnoty a ceny. V prípade akýchkoľvek otázok nás, prosím, kontaktujte. Radi vám dokážeme, že sme profesionáli a že montujeme kvalitné a osvedčené výrobky JABLOTRON, firmy s dlhoročnou tradíciou")
        .text("S pozdravom")
        .text("Michal Varchola")
        .text("RAMcom, s.r.o.")
        //.font("Cardo-Bold")
        .text("Referencie:", 50)
        //.font("Cardo")
        .text("naša firma vykonala už množstvo montáží systému JABLOTRON 100 s veľmi dobrými výsledkami. Z bezpečnostnýchl dôvodov však nemôžeme zverejňovať detaily o našich predchádzajúcich zákazníkoch")
        .text("systém JABLOTRON 100+ tiež získal sériu ocenení na tuzemských aj zahraničných výstavách. Podrobnosti o ponúkanom produkte nájdete na www.jablotron.sk.")
}


export function generateFooter(doc: PDFKit.PDFDocument) {
    const footerHeight = 50;
    const pageHeight = doc.page.height;
    const marginBottom = doc.page.margins.bottom;

    doc
        .fontSize(10)
        .text(
            "RAMcom, s.r.o., Poštová 14, Košice, tel.:+421915944449",
            doc.page.margins.left,
            pageHeight - marginBottom - footerHeight,
            { align: "center", width: 500 }
        )
        .text(
            "E-mail:ramcom@ramcom.sk, IČO: 43889395, IČDPH : SK2020003435",
            doc.page.margins.left,
            pageHeight - marginBottom - footerHeight + 15,
            { align: "center", width: 500 }
        );
}


export function generateTableRow(doc: PDFKit.PDFDocument, y: number, item: string,
    description: string, unitCost: string, quantity: string, lineTotal: string
) {
    doc
        .fontSize(10)
        .text(item, 50, y)
        .text(description, 150, y)
        .text(unitCost, 280, y, { width: 90, align: "right" })
        .text(quantity, 370, y, { width: 90, align: "right" })
        .text(lineTotal, 0, y, { align: "right" });
}

export function generateHr(doc: PDFKit.PDFDocument, y: number) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

export function formatCurrency(cents: number): string {
    return "€" + (cents / 100).toFixed(2);
}

export function formatDate(date: Date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return year + "/" + month + "/" + day;
}
