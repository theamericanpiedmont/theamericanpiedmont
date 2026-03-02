// src/sanity/structure.ts
import type { StructureResolver } from "sanity/structure"
import AutomationPane from "@/sanity/components/AutomationPane"

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Newsroom")
    .items([
      // =========================
      // NARRATIVE
      // =========================
      S.listItem()
        .title("Narrative")
        .child(
          S.list()
            .title("Narrative")
            .items([
              S.documentTypeListItem("essay").title("Essays"),
              // Keep Marginalia here if you still treat it as “written / curated narrative”
              // If you later retire it, you can remove this line without impacting other groups.
              //S.documentTypeListItem("marginalia").title("Marginalia"),
            ])
        ),

      // =========================
      // REPORTING
      // =========================
      S.listItem()
        .title("Reporting")
        .child(
          S.list()
            .title("Reporting")
            .items([
              S.documentTypeListItem("fieldNote").title("Field Notes"),
            ])
        ),

      // =========================
      // INTAKE
      // =========================
      S.listItem()
        .title("Intake")
        .child(
          S.list()
            .title("Intake")
            .items([
              S.listItem()
                .title("Signals")
                .child(
                  S.list()
                    .title("Signals")
                    .items([
                      // ✅ Queue (only suggested)
                      S.listItem()
                        .title("Queue (Suggested)")
                        .child(
                          S.documentList()
                            .title("Queue (Suggested)")
                            .schemaType("marginaliaSignal")
                            .filter('_type == "marginaliaSignal" && status == "suggested"')
                            .defaultOrdering([{ field: "score", direction: "desc" }])
                        ),

                      S.divider(),

                      // Buckets inside the queue
                      S.listItem()
                        .title("Queue — Crease")
                        .child(
                          S.documentList()
                            .title("Queue — Crease")
                            .schemaType("marginaliaSignal")
                            .filter(
                              '_type == "marginaliaSignal" && status == "suggested" && pillar == "crease"'
                            )
                            .defaultOrdering([{ field: "score", direction: "desc" }])
                        ),

                      S.listItem()
                        .title("Queue — Present Tense")
                        .child(
                          S.documentList()
                            .title("Queue — Present Tense")
                            .schemaType("marginaliaSignal")
                            .filter(
                              '_type == "marginaliaSignal" && status == "suggested" && pillar == "present"'
                            )
                            .defaultOrdering([{ field: "score", direction: "desc" }])
                        ),

                      S.listItem()
                        .title("Queue — Memories of the Future")
                        .child(
                          S.documentList()
                            .title("Queue — Memories of the Future")
                            .schemaType("marginaliaSignal")
                            .filter(
                              '_type == "marginaliaSignal" && status == "suggested" && pillar == "future"'
                            )
                            .defaultOrdering([{ field: "score", direction: "desc" }])
                        ),

                      S.divider(),

                      // ✅ Published (what the homepage shows)
                      S.listItem()
                        .title("Published")
                        .child(
                          S.documentList()
                            .title("Published")
                            .schemaType("marginaliaSignal")
                            .filter('_type == "marginaliaSignal" && status == "published"')
                            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                        ),

                      // ✅ Rejected (out of the queue, but still accessible)
                      S.listItem()
                        .title("Rejected")
                        .child(
                          S.documentList()
                            .title("Rejected")
                            .schemaType("marginaliaSignal")
                            .filter('_type == "marginaliaSignal" && status == "rejected"')
                            .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
                        ),

                      S.divider(),

                      // Everything (debug / admin)
                      S.documentTypeListItem("marginaliaSignal").title("All Signals"),
                    ])
                ),
            ])
        ),

      // =========================
      // ARCHIVE
      // =========================
      S.listItem()
        .title("Archive")
        .child(
          S.list()
            .title("Archive")
            .items([
              S.listItem()
                .title("Artifacts")
                .child(
                  S.list()
                    .title("Artifacts")
                    .items([
                      S.listItem()
                        .title("Published")
                        .child(
                          S.documentList()
                            .title("Published Artifacts")
                            .schemaType("artifact")
                            .filter('_type == "artifact" && status == "published"')
                        ),

                      S.listItem()
                        .title("Draft / Unpublished")
                        .child(
                          S.documentList()
                            .title("Draft / Unpublished")
                            .schemaType("artifact")
                            .filter('_type == "artifact" && (!defined(status) || status != "published")')
                        ),

                      S.divider(),

                      S.documentTypeListItem("artifact").title("All Artifacts"),
                    ])
                ),
            ])
        ),

      S.divider(),

S.listItem()
  .title("Automation")
  .child(
    S.component(AutomationPane).title("Automation")
  ),

S.listItem()
  .title("Signal Runs")
  .child(
    S.documentTypeList("signalRun")
      .title("Signal Runs")
  ),

S.divider(),

      // =========================
      // TAXONOMY
      // =========================
      S.listItem()
        .title("Taxonomy")
        .child(
          S.list()
            .title("Taxonomy")
            .items([
              S.documentTypeListItem("section").title("Sections"),
              S.documentTypeListItem("author").title("Authors"),
            ])
        ),
    ])