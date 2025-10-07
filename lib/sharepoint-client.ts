import { Client } from "@microsoft/microsoft-graph-client"
import { ClientSecretCredential } from "@azure/identity"

interface MaintenanceIssue {
  id: string
  title: string
  description: string
  category: string
  location: string
  priority: "baja" | "media" | "alta" | "urgente"
  status: "pendiente" | "en_progreso" | "resuelta"
  reported_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

class SharePointClient {
  private client: Client | null = null
  private siteId = ""
  private listId = ""

  private async getClient() {
    if (this.client) return this.client

    const tenantId = process.env.AZURE_TENANT_ID
    const clientId = process.env.AZURE_CLIENT_ID
    const clientSecret = process.env.AZURE_CLIENT_SECRET

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error("Azure AD credentials not configured")
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret)

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken("https://graph.microsoft.com/.default")
          return token.token
        },
      },
    })

    return this.client
  }

  private async getSiteAndListIds() {
    if (this.siteId && this.listId) {
      return { siteId: this.siteId, listId: this.listId }
    }

    const siteUrl = process.env.SHAREPOINT_SITE_URL
    const listName = process.env.SHAREPOINT_LIST_NAME

    if (!siteUrl || !listName) {
      throw new Error("SharePoint site URL or list name not configured")
    }

    const client = await this.getClient()

    // Extract site path from URL
    const url = new URL(siteUrl)
    const sitePath = url.pathname

    // Get site ID
    const site = await client.api(`/sites/${url.hostname}:${sitePath}`).get()
    this.siteId = site.id

    // Get list ID
    const list = await client.api(`/sites/${this.siteId}/lists`).filter(`displayName eq '${listName}'`).get()

    if (!list.value || list.value.length === 0) {
      throw new Error(`SharePoint list '${listName}' not found`)
    }

    this.listId = list.value[0].id

    return { siteId: this.siteId, listId: this.listId }
  }

  async getItems(): Promise<MaintenanceIssue[]> {
    const client = await this.getClient()
    const { siteId, listId } = await this.getSiteAndListIds()

    const response = await client.api(`/sites/${siteId}/lists/${listId}/items`).expand("fields").get()

    return response.value.map((item: any) => this.mapSharePointItem(item))
  }

  async getItemById(id: string): Promise<MaintenanceIssue | null> {
    const client = await this.getClient()
    const { siteId, listId } = await this.getSiteAndListIds()

    try {
      const item = await client.api(`/sites/${siteId}/lists/${listId}/items/${id}`).expand("fields").get()

      return this.mapSharePointItem(item)
    } catch (error) {
      return null
    }
  }

  async createItem(data: Omit<MaintenanceIssue, "id" | "created_at" | "updated_at">): Promise<MaintenanceIssue> {
    const client = await this.getClient()
    const { siteId, listId } = await this.getSiteAndListIds()

    const fields = {
      Title: data.title,
      Description: data.description,
      Category: data.category,
      Location: data.location,
      Priority: data.priority,
      Status: data.status,
      ReportedBy: data.reported_by,
      AssignedTo: data.assigned_to || "",
      ResolvedAt: data.resolved_at || "",
    }

    const response = await client.api(`/sites/${siteId}/lists/${listId}/items`).post({ fields })

    const item = await client.api(`/sites/${siteId}/lists/${listId}/items/${response.id}`).expand("fields").get()

    return this.mapSharePointItem(item)
  }

  async updateItem(id: string, data: Partial<MaintenanceIssue>): Promise<MaintenanceIssue> {
    const client = await this.getClient()
    const { siteId, listId } = await this.getSiteAndListIds()

    const fields: any = {}
    if (data.title) fields.Title = data.title
    if (data.description) fields.Description = data.description
    if (data.category) fields.Category = data.category
    if (data.location) fields.Location = data.location
    if (data.priority) fields.Priority = data.priority
    if (data.status) fields.Status = data.status
    if (data.reported_by) fields.ReportedBy = data.reported_by
    if (data.assigned_to !== undefined) fields.AssignedTo = data.assigned_to
    if (data.resolved_at !== undefined) fields.ResolvedAt = data.resolved_at

    await client.api(`/sites/${siteId}/lists/${listId}/items/${id}/fields`).patch(fields)

    const item = await client.api(`/sites/${siteId}/lists/${listId}/items/${id}`).expand("fields").get()

    return this.mapSharePointItem(item)
  }

  async deleteItem(id: string): Promise<void> {
    const client = await this.getClient()
    const { siteId, listId } = await this.getSiteAndListIds()

    await client.api(`/sites/${siteId}/lists/${listId}/items/${id}`).delete()
  }

  private mapSharePointItem(item: any): MaintenanceIssue {
    const fields = item.fields
    return {
      id: item.id,
      title: fields.Title || "",
      description: fields.Description || "",
      category: fields.Category || "",
      location: fields.Location || "",
      priority: fields.Priority || "media",
      status: fields.Status || "pendiente",
      reported_by: fields.ReportedBy || "",
      assigned_to: fields.AssignedTo || undefined,
      created_at: fields.Created || new Date().toISOString(),
      updated_at: fields.Modified || new Date().toISOString(),
      resolved_at: fields.ResolvedAt || undefined,
    }
  }
}

export const sharePointClient = new SharePointClient()
