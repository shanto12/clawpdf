import { PDFDocument } from "pdf-lib";

export interface FormFieldInfo {
  name: string;
  type: "text" | "checkbox" | "radio" | "dropdown" | "optionList" | "button" | "signature" | "unknown";
  value?: string | boolean | string[];
  options?: string[];
}

export async function listFormFields(bytes: Uint8Array): Promise<FormFieldInfo[]> {
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();
  const fields = form.getFields();
  return fields.map((f) => {
    const name = f.getName();
    const ctor = f.constructor.name;
    if (ctor === "PDFTextField") {
      const tf = form.getTextField(name);
      return { name, type: "text", value: tf.getText() ?? "" };
    }
    if (ctor === "PDFCheckBox") {
      const cb = form.getCheckBox(name);
      return { name, type: "checkbox", value: cb.isChecked() };
    }
    if (ctor === "PDFRadioGroup") {
      const rg = form.getRadioGroup(name);
      return { name, type: "radio", value: rg.getSelected() ?? "", options: rg.getOptions() };
    }
    if (ctor === "PDFDropdown") {
      const dd = form.getDropdown(name);
      return { name, type: "dropdown", value: dd.getSelected(), options: dd.getOptions() };
    }
    if (ctor === "PDFOptionList") {
      const ol = form.getOptionList(name);
      return { name, type: "optionList", value: ol.getSelected(), options: ol.getOptions() };
    }
    if (ctor === "PDFButton") return { name, type: "button" };
    if (ctor === "PDFSignature") return { name, type: "signature" };
    return { name, type: "unknown" };
  });
}

export async function fillFormFields(
  bytes: Uint8Array,
  values: Record<string, string | boolean | string[]>,
  flatten = false,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();
  for (const [name, value] of Object.entries(values)) {
    const f = form.getFieldMaybe(name);
    if (!f) continue;
    const ctor = f.constructor.name;
    try {
      if (ctor === "PDFTextField" && typeof value === "string") {
        form.getTextField(name).setText(value);
      } else if (ctor === "PDFCheckBox" && typeof value === "boolean") {
        const cb = form.getCheckBox(name);
        if (value) cb.check();
        else cb.uncheck();
      } else if (ctor === "PDFRadioGroup" && typeof value === "string") {
        form.getRadioGroup(name).select(value);
      } else if (ctor === "PDFDropdown" && typeof value === "string") {
        form.getDropdown(name).select(value);
      } else if (ctor === "PDFOptionList" && Array.isArray(value)) {
        form.getOptionList(name).select(value);
      }
    } catch {
      // ignore individual field errors so one bad field doesn't kill the whole save
    }
  }
  if (flatten) form.flatten();
  return doc.save();
}
