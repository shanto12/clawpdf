import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { listFormFields, fillFormFields } from "@/lib/pdf/forms";

async function buildFormPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);
  const form = doc.getForm();
  const tf = form.createTextField("name");
  tf.setText("");
  tf.addToPage(page, { x: 50, y: 300, width: 200, height: 20 });
  const cb = form.createCheckBox("agree");
  cb.addToPage(page, { x: 50, y: 250, width: 15, height: 15 });
  return doc.save();
}

describe("forms", () => {
  it("lists fields and types", async () => {
    const pdf = await buildFormPdf();
    const fields = await listFormFields(pdf);
    expect(fields).toHaveLength(2);
    expect(fields.find((f) => f.name === "name")?.type).toBe("text");
    expect(fields.find((f) => f.name === "agree")?.type).toBe("checkbox");
  });

  it("fills text and checkbox fields", async () => {
    const pdf = await buildFormPdf();
    const filled = await fillFormFields(pdf, { name: "Tuco", agree: true });
    const fields = await listFormFields(filled);
    expect(fields.find((f) => f.name === "name")?.value).toBe("Tuco");
    expect(fields.find((f) => f.name === "agree")?.value).toBe(true);
  });
});
