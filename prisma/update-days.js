import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const transactions = await prisma.transaction.findMany();
  console.log(`Found ${transactions.length} transactions to update`);
  
  let updated = 0;
  
  for (const transaction of transactions) {
    const createdAt = new Date(transaction.createdAt);
    const day = createdAt.getDate().toString();
    console.log(`Updating transaction ${transaction.id} with day ${day}`);
    
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { day }
    });
    
    updated++;
    if (updated % 100 === 0) {
      console.log(`Updated ${updated} transactions so far`);
    }
  }
  
  console.log(`Successfully updated ${updated} transactions with day values`);
}

main()
  .catch(e => {
    console.error('Error updating transactions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });