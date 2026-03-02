import { defineField, defineType } from "sanity"

export const signalRunType = defineType({
  name: "signalRun",
  title: "Signal Runs",
  type: "document",
  fields: [
    defineField({
      name: "requestedAt",
      title: "Requested At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "requestedBy",
      title: "Requested By",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["queued", "running", "success", "error"] },
      initialValue: "queued",
      readOnly: true,
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 3,
      readOnly: true,
    }),
  ],
})