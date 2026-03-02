"use client"

import { useState } from "react"
import { Box, Button, Card, Stack, Text } from "@sanity/ui"
import { useClient, useCurrentUser } from "sanity"

export default function AutomationPane() {
  const client = useClient({ apiVersion: "2025-01-01" })
  const user = useCurrentUser()
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string>("")

  async function requestSignalsRun() {
    setBusy(true)
    setNote("")
    try {
      const requestedBy =
        user?.name || user?.email || user?.id || "unknown"

      await client.create({
        _type: "signalRun",
        requestedAt: new Date().toISOString(),
        requestedBy,
        status: "queued",
        message: "Requested from Studio button.",
      })

      setNote("Queued. Webhook will trigger the automation.")
    } catch (e: any) {
      setNote(e?.message || "Failed to create run request.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Card padding={4} radius={3} shadow={1} tone="transparent">
          <Stack space={3}>
            <Text size={2} weight="semibold">
              Automation
            </Text>
            <Text size={1} muted>
              Run the Signals ingestion job now. This creates a run request document and
              triggers a secure Sanity webhook to your site.
            </Text>

            <Button
              text={busy ? "Running…" : "Run Signals Now"}
              tone="primary"
              disabled={busy}
              onClick={requestSignalsRun}
            />

            {note ? (
              <Card padding={3} radius={2} tone="transparent" border>
                <Text size={1}>{note}</Text>
              </Card>
            ) : null}
          </Stack>
        </Card>
      </Stack>
    </Box>
  )
}