const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { modules } = require("./seed-data");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe12345";

  if (isProduction && (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD)) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required in production.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", passwordHash },
    create: { email: adminEmail, role: "admin", passwordHash },
  });

  for (const module of modules) {
    await prisma.module.upsert({
      where: { slug: module.slug },
      update: {
        title: module.title,
        description: module.description,
        riskLevel: module.riskLevel,
        difficulty: module.difficulty,
        lifecycleStage: module.lifecycleStage,
      },
      create: module,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
