import { PrismaClient } from './src/generated/prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@admin.com'
    const user = await prisma.user.findUnique({
        where: { email },
    })

    console.log('User found:', user)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
