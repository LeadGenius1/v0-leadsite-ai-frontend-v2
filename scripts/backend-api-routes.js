// ============================================
// FILE: src/routes/api.js
// ============================================
// Copy this file to your backend repository at: src/routes/api.js

async function apiRoutes(fastify, options) {
  // GET /api/dashboard/overview
  fastify.get("/api/dashboard/overview", async (request, reply) => {
    try {
      return {
        totalProspects: 1234,
        totalEmails: 5678,
        totalReplies: 432,
        activeCampaigns: 3,
        conversionRate: 35,
        campaignPerformance: [
          { name: "Campaign 1", openRate: 45, clickRate: 12, replyRate: 8 },
          { name: "Campaign 2", openRate: 52, clickRate: 15, replyRate: 10 },
          { name: "Campaign 3", openRate: 38, clickRate: 9, replyRate: 6 },
        ],
        recentActivity: [
          { type: "email_sent", description: "Email sent to john@company.com", timestamp: new Date().toISOString() },
          { type: "reply_received", description: "Reply from sarah@company.com", timestamp: new Date().toISOString() },
          { type: "prospect_added", description: "New prospect added", timestamp: new Date().toISOString() },
        ],
      }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Internal Server Error" })
    }
  })

  // GET /api/prospects
  fastify.get("/api/prospects", async (request, reply) => {
    try {
      return {
        prospects: [
          { id: 1, name: "John Doe", email: "john@company.com", industry: "Tech", status: "active" },
          { id: 2, name: "Jane Smith", email: "jane@company.com", industry: "Finance", status: "active" },
          { id: 3, name: "Bob Johnson", email: "bob@company.com", industry: "Real Estate", status: "converted" },
          { id: 4, name: "Alice Williams", email: "alice@company.com", industry: "Healthcare", status: "active" },
          { id: 5, name: "Charlie Brown", email: "charlie@company.com", industry: "Manufacturing", status: "pending" },
        ],
        total: 1234,
      }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Internal Server Error" })
    }
  })

  // GET /api/emails
  fastify.get("/api/emails", async (request, reply) => {
    try {
      return {
        emails: [
          {
            id: 1,
            subject: "Introducing LeadSite.AI",
            status: "opened",
            sentAt: new Date().toISOString(),
            prospectId: 1,
          },
          {
            id: 2,
            subject: "Quick question about your needs",
            status: "replied",
            sentAt: new Date().toISOString(),
            prospectId: 2,
          },
          {
            id: 3,
            subject: "Follow up on our conversation",
            status: "sent",
            sentAt: new Date().toISOString(),
            prospectId: 3,
          },
          {
            id: 4,
            subject: "Special offer for your business",
            status: "opened",
            sentAt: new Date().toISOString(),
            prospectId: 4,
          },
          {
            id: 5,
            subject: "Partnership opportunity",
            status: "clicked",
            sentAt: new Date().toISOString(),
            prospectId: 5,
          },
        ],
        total: 5678,
      }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Internal Server Error" })
    }
  })

  // GET /api/campaigns
  fastify.get("/api/campaigns", async (request, reply) => {
    try {
      return {
        campaigns: [
          { id: 1, name: "Q1 Outreach", status: "active", createdAt: new Date().toISOString() },
          { id: 2, name: "Tech Industry Push", status: "active", createdAt: new Date().toISOString() },
          { id: 3, name: "Holiday Campaign", status: "completed", createdAt: new Date().toISOString() },
        ],
      }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Internal Server Error" })
    }
  })

  // GET /api/n8n/status
  fastify.get("/api/n8n/status", async (request, reply) => {
    try {
      return {
        status: "connected",
        workflows: [
          { name: "Business Analysis", status: "active", lastRun: new Date().toISOString() },
          { name: "Daily Prospect Discovery", status: "active", lastRun: new Date().toISOString() },
          { name: "Email Campaigns", status: "active", lastRun: new Date().toISOString() },
          { name: "Reply Processing", status: "active", lastRun: new Date().toISOString() },
        ],
      }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Internal Server Error" })
    }
  })
}

module.exports = apiRoutes

// ============================================
// MODIFICATION FOR: src/index.js
// ============================================
// Add this line where other routes are registered (after other route files):
//
// fastify.register(require('./routes/api'));
//
// Example of where to add it in your index.js:
//
// // Register routes
// fastify.register(require('./routes/health'));
// fastify.register(require('./routes/api'));  // <-- ADD THIS LINE
//
