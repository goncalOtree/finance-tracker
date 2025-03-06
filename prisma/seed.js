import { CategoryType, PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();



async function main() {
  const transactionsData = JSON.parse(fs.readFileSync("prisma/categories.json", "utf8"));

  // Fetch category IDs for all transactions
  const transactions = await Promise.all(
    transactionsData.map(async (transaction) => {

      return {
        name: transaction.name,
        type: transaction.type,
        authorId: transaction.authorId,
        icon: transaction.icon,
      };
    })
  );

  await prisma.category.createMany({
    data: transactions,
    skipDuplicates: true, // Avoid inserting duplicates
  });

  console.log("Transactions seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });