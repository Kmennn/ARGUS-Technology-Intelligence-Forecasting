import { NextResponse } from "next/server"
import crypto from "crypto"
import { ENGINE_VERSION } from "@/lib/horizonEngine"

type ExportPayload = {
  stateSnapshot: unknown
  institutionalMemory: unknown
  timerState: unknown
}

type ExportArtifact = {
  metadata: {
    exportId: string
    issuer: string
    timestamp: string
    engineVersion: string
  }
  payload: ExportPayload
  signature: {
    algorithm: string
    digest: string
  }
}

function canonicalStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    if (Number.isNaN(obj)) return '"NaN"'
    if (obj === Infinity) return '"Infinity"'
    if (obj === -Infinity) return '"-Infinity"'
    return JSON.stringify(obj)
  }

  if (Array.isArray(obj)) {
    const elements = obj.map(canonicalStringify).join(",")
    return `[${elements}]`
  }

  const keys = Object.keys(obj).sort()
  const keyValuePairs = keys.map(
    key => `"${key}":${canonicalStringify((obj as Record<string, unknown>)[key])}`
  )

  return `{${keyValuePairs.join(",")}}`
}

function computeDigest(payload: ExportPayload): string {
  const canonical = canonicalStringify(payload)

  const hash = crypto
    .createHash("sha256")
    .update(canonical)
    .digest("hex")

  return `ARGUS-SHA256-${hash.toUpperCase()}`
}

export async function POST(req: Request) {
  try {
    const role = req.headers.get("X-ARGUS-ROLE")

    if (role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized export attempt. Role Admin required." },
        { status: 403 }
      )
    }

    const body = await req.json()

    if (!body.payload) {
      return NextResponse.json(
        { error: "Missing payload" },
        { status: 400 }
      )
    }

    const payload: ExportPayload = body.payload
    const digest = computeDigest(payload)

    const artifact: ExportArtifact = {
      metadata: {
        exportId: crypto.randomUUID(),
        issuer: "ARGUS CORE ALLOCATOR",
        timestamp: new Date().toISOString(),
        engineVersion: ENGINE_VERSION
      },
      payload,
      signature: {
        algorithm: "SHA-256",
        digest
      }
    }

    return NextResponse.json(artifact)
  } catch {
    return NextResponse.json(
      { error: "Export signing failed" },
      { status: 500 }
    )
  }
}
