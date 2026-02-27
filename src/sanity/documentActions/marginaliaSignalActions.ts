import type { DocumentActionComponent, DocumentActionProps } from "sanity"
import { useClient } from "sanity"
import { useCallback } from "react"

function nowISO() {
  return new Date().toISOString()
}

// Helper: in Studio, draft ids look like "drafts.<id>"
function getTargetId(props: DocumentActionProps) {
  const draftId = props.draft?._id
  const publishedId = props.published?._id
  return draftId || publishedId || null
}

export const publishNowAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const client = useClient({ apiVersion: "2025-01-01" })
  const id = getTargetId(props)
  const status = (props.draft as any)?.status ?? (props.published as any)?.status

  const onHandle = useCallback(async () => {
    if (!id) return

    // Set fields (status + publishedAt)
    await client
      .patch(id)
      .set({ status: "published" })
      .setIfMissing({ publishedAt: nowISO() })
      .commit({ autoGenerateArrayKeys: true })

    // If it's a draft, also publish it (create the non-draft doc)
    // This works by creating/updating the published document id (without "drafts.")
    if (id.startsWith("drafts.")) {
      const publishedId = id.replace(/^drafts\./, "")
      const draftDoc = await client.getDocument(id)

      if (draftDoc) {
        // Remove Sanity system fields that should not be duplicated
        const { _id, _rev, _createdAt, _updatedAt, ...rest } = draftDoc as any
        await client
          .createOrReplace({ _id: publishedId, ...rest, status: "published", publishedAt: (draftDoc as any).publishedAt ?? nowISO() })
      }

      // Optionally delete the draft version after publishing
      await client.delete(id)
    }

    props.onComplete()
  }, [client, id, props])

  return {
    label: "Publish now",
    tone: "positive",
    disabled: status === "published",
    onHandle,
  }
}

export const rejectNowAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const client = useClient({ apiVersion: "2025-01-01" })
  const id = getTargetId(props)
  const status = (props.draft as any)?.status ?? (props.published as any)?.status

  const onHandle = useCallback(async () => {
    if (!id) return

    // Mark rejected
    await client.patch(id).set({ status: "rejected" }).commit()

    // If it's a draft, keep it simple: delete draft so it vanishes from queue immediately
    // (If you prefer to keep rejected drafts, remove the next 2 lines.)
    if (id.startsWith("drafts.")) {
      await client.delete(id)
    }

    props.onComplete()
  }, [client, id, props])

  return {
    label: "Reject (remove from queue)",
    tone: "critical",
    disabled: status === "rejected",
    onHandle,
  }
}