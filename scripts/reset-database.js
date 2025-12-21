// Database Reset Script for Railway PostgreSQL
// Run with: node scripts/reset-database.js

import pg from "pg"
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable not found")
  console.log("\nMake sure you have DATABASE_URL in your environment variables.")
  process.exit(1)
}

async function resetDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    console.log("🔌 Connecting to database...")
    await client.connect()
    console.log("✅ Connected successfully\n")

    // Start transaction
    await client.query("BEGIN")

    // Delete all user-related data in the correct order (respecting foreign keys)
    console.log("🗑️  Deleting user data...\n")

    const deletions = [
      { table: "email_campaigns", description: "Email campaigns" },
      { table: "email_stats", description: "Email statistics" },
      { table: "prospects", description: "Prospects" },
      { table: "activities", description: "Activity logs" },
      { table: "profiles", description: "User profiles" },
      { table: "users", description: "Users" },
    ]

    for (const { table, description } of deletions) {
      try {
        const result = await client.query(`DELETE FROM ${table}`)
        console.log(`✅ Deleted ${result.rowCount} rows from ${description} (${table})`)
      } catch (error) {
        // Table might not exist, continue
        console.log(`⚠️  Table ${table} not found or already empty`)
      }
    }

    // Commit transaction
    await client.query("COMMIT")

    console.log("\n✨ Database reset completed successfully!")
    console.log("All users and related data have been deleted.\n")
  } catch (error) {
    // Rollback on error
    await client.query("ROLLBACK")
    console.error("❌ Error resetting database:", error.message)
    console.error("\nFull error:", error)
    process.exit(1)
  } finally {
    await client.end()
    console.log("🔌 Database connection closed")
  }
}

// Confirmation prompt
console.log("⚠️  WARNING: DATABASE RESET SCRIPT")
console.log("═".repeat(50))
console.log("This will permanently delete ALL users and related data!")
console.log("This action CANNOT be undone.")
console.log("═".repeat(50))
console.log("\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n")

setTimeout(() => {
  resetDatabase()
}, 5000)
