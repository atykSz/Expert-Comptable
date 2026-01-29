
import { PrismaClient, UserRole } from '../src/generated/prisma/client'
import { hash } from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
    log: ['info']
})

async function main() {
    const email = 'admin@admin.com'
    const password = 'Samuel'
    const name = 'Admin System'

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Upsert user (create if not exists, update if exists)
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: UserRole.ADMIN,
        },
        create: {
            email,
            name,
            password: hashedPassword,
            role: UserRole.ADMIN,
        },
    })

    console.log({ user })
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
