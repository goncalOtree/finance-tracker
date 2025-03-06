import { CategoryType, PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

export async function getCategoryByName(name, authorId) {
  const cat = await prisma.category.findUnique({
    where: {
      name_authorId: {
        name,
        authorId
      }
    }
  });

  return cat ? cat.id : null;
}

async function main() {
  const transactionsData = JSON.parse(fs.readFileSync("server/transactions.json", "utf8"));

  // Fetch category IDs for all transactions
  const transactions = await Promise.all(
    transactionsData.map(async (transaction) => {
      const categoryId = await getCategoryByName(transaction.categoryName, null);

      if (!categoryId) {
        throw new Error(`Category not found for: ${transaction.categoryName}`);
      }

      return {
        authorId: transaction.authorId,
        month: transaction.month,
        year: transaction.year,
        categoryId, // Now properly awaited
        amount: transaction.amount,
      };
    })
  );

  await prisma.transaction.createMany({
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
