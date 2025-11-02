import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('❌ DATABASE_URL non défini (vérifie ton fichier .env)')
}


const sql = postgres(connectionString, { ssl: 'require' })

async function main() {
  try {
    const result = await sql`SELECT NOW() AS current_time`
    console.log('✅ Connexion OK - heure du serveur :', result[0].current_time)
  } catch (error) {
    console.error('❌ Erreur de connexion :', error)
  } finally {
    await sql.end({ timeout: 5 })
  }
}

main()
