"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getDbUserId } from "./user.action";


const monthsOrder = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

// Fetch categories (both default and user-specific)
export async function fetchCategories() {
  const userId = await getDbUserId();
  
  if (!userId) return [];

  return prisma.category.findMany({
    where: {
      OR: [{ authorId: userId }, { authorId: null }],
    },
    orderBy: { name: "asc" },
  });

  
}

export async function getCategorybyId(id: string) {
  const cat = await prisma.category.findUnique({
    where: {
      id,
    }
  });
  
  if (!cat) {
    return null; 
  }

  
  return cat.name;
}


export async function getCategoryByName(name: string, authorId: any) {
  const cat = await prisma.category.findUnique({
    where: {
      name_authorId: {
        name,
        authorId
      }
    }
  });

  if (!cat) {
    return null;
  }
  return cat.id;
}

// Create a new transaction
export async function createTransaction({ amount, month, year, categoryId, name }: 
  { amount: number; month: string; year: number; categoryId: string; name?: string }) {
  
  const userId  = await getDbUserId();
  if (!userId) throw new Error("Unauthorized");

  return prisma.transaction.create({
    data: {
      amount,
      month: month,
      year: year.toString(),
      categoryId,
      name: name || null,
      authorId: userId,
    },
  });
}


export async function fetchRecentTransactions(limit = 5) {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return prisma.transaction.findMany({
    take: limit,
    include: {
      category: true
    },
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function fetchTransactions() {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.transaction.findMany({
    include: {
      category: true
    },
    where: { authorId: userId },
  });

  return data.sort(
    (a, b) =>
      monthsOrder.indexOf(a.month.toLowerCase()) - monthsOrder.indexOf(b.month.toLowerCase())
  );

}


export async function fetchTransactionsbyYear(year: string) {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.transaction.findMany({
    include: {
      category: true
    },
    where: { authorId: userId, year:year},
  });

  return data.sort(
    (a, b) =>
      monthsOrder.indexOf(a.month.toLowerCase()) - monthsOrder.indexOf(b.month.toLowerCase())
  );
}

export async function fetchTransactionsbyCategory(year: string, CategoryName: string) {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return prisma.transaction.findMany({
    include: {
      category: true
    },
    where: { authorId: userId, year:year, category: {
      name: CategoryName},  
    },
  });
}


export async function getTotalbyYear() {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await prisma.transaction.groupBy({
    by: ['year'],
    _sum: {
      amount: true,
    },

    where: {
      authorId: userId
    }
  })
}

export async function getTotalbyMonth(year:string) {
  const userId = await getDbUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.transaction.groupBy({
    by: ['month'],
    _sum: {
      amount: true,
    },

    where: {
      authorId: userId,
      year: year,
      category: {
        type: {
          in: ["FIXO", "VARIÁVEL"]
        }
      }
    }
  })

  return data.sort(
    (a, b) =>
      monthsOrder.indexOf(a.month.toLowerCase()) - monthsOrder.indexOf(b.month.toLowerCase())
  );}


  export async function getTotalByMonthAndCategory(year: string) {
    const userId = await getDbUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }
  
    // Fetch all transactions for the given year
    const transactions = await prisma.transaction.findMany({
      where: {
        authorId: userId,
        year: year,
      },
      include: {
        category: true,
      },
    });
  
    // Group transactions by month and category
    const grouped = transactions.reduce((acc, transaction) => {
      const month = transaction.month.toLowerCase();
      const category = transaction.category.name;
  
      if (!acc[month]) {
        acc[month] = {};
      }
  
      if (!acc[month][category]) {
        acc[month][category] = 0;
      }
  
      acc[month][category] += transaction.amount;
      return acc;
    }, {} as Record<string, Record<string, number>>);
  
    return grouped;
  }


  export async function deleteTransaction(id: string) {
    const userId = await getDbUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }
  
    try {
      // First verify that the transaction belongs to the user
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: id,
        },
      });
  
      if (!transaction) {
        throw new Error("Transaction not found");
      }
  
      if (transaction.authorId !== userId) {
        throw new Error("Not authorized to delete this transaction");
      }
  
      // Delete the transaction
      const deleted = await prisma.transaction.delete({
        where: {
          id: id,
        },
      });
  
      return deleted;
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw error;
    }
  }

