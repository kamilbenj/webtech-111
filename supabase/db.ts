import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('❌ DATABASE_URL non défini (vérifie ton fichier .env)')
}

// Typage du client SQL
const sql = postgres(connectionString, {
  ssl: 'require',
})

export default sql
