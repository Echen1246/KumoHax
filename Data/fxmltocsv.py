import xml.etree.ElementTree as ET
import csv

# Define the fields we want to extract from the XML
FIELDS = [
    "safetyreportid",
    "safetyreportversion",
    "primarysourcecountry",
    "occurcountry",
    "reportercountry",
    "authoritynumb",
    "companynumb",
    "reporttype",
    "serious",
    "seriousnessdeath",
    "seriousnesslifethreatening",
    "seriousnesshospitalization",
    "seriousnessdisabling",
    "seriousnesscongenitalanomali",
    "seriousnessother",
    "receivedate",
    "receiptdate",
    "fulfillexpeditecriteria",
    "patientonsetage",
    "patientonsetageunit",
    "patientagegroup",
    "patientweight",
    "patientsex",
    "reactionmeddrapt",
    "reactionoutcome",
    "drugcharacterization",
    "medicinalproduct",
    "activesubstancename",
    "drugdosagetext",
    "drugindication",
    "drugadministrationroute"
]

def parse_faers_xml(xml_file, csv_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # Open CSV for writing
    with open(csv_file, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()

        # Iterate through each safetyreport
        for report in root.findall(".//safetyreport"):
            row = {field: "" for field in FIELDS}

            for field in FIELDS:
                elem = report.find(f".//{field}")
                if elem is not None and elem.text:
                    row[field] = elem.text.strip()

            # Handle multiple reactions (flatten into semicolon-separated list)
            reactions = [r.text for r in report.findall(".//reactionmeddrapt") if r.text]
            if reactions:
                row["reactionmeddrapt"] = "; ".join(reactions)

            outcomes = [o.text for o in report.findall(".//reactionoutcome") if o.text]
            if outcomes:
                row["reactionoutcome"] = "; ".join(outcomes)

            # Handle multiple drugs
            drugs = [d.text for d in report.findall(".//medicinalproduct") if d.text]
            if drugs:
                row["medicinalproduct"] = "; ".join(drugs)

            actives = [a.text for a in report.findall(".//activesubstancename") if a.text]
            if actives:
                row["activesubstancename"] = "; ".join(actives)

            writer.writerow(row)


if __name__ == "__main__":
    # Example usage
    xml_input = "C:\\Users\\trevo\\Desktop\\Kumo\\KumoHax\\Data\\faers_xml_2025q2\\XML\\3_ADR25Q2.xml"  # Replace with your FAERS XML file
    csv_output = "faers_output.csv"
    parse_faers_xml(xml_input, csv_output)
    print(f"CSV saved to {csv_output}")
