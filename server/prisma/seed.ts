import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  // Order models so that those with dependencies (child models) are deleted first
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  // Correct order to handle foreign key constraints (delete children before parents)
  const deleteOrder = [
    "Users",
    "Suppliers",
    "BlockTypes",
    "Blocks",
    "Sales",
    "Purchases",
    "Expenses",
    "ExpenseByCategory",
    "ExpenseSummary",
    "Products",
    "SalesSummary",
    "PurchaseSummary",
  ];

  // Delete the data in the correct order
  for (const modelName of deleteOrder) {
    const model: any = prisma[modelName as keyof typeof prisma];
    if (model) {
      try {
        await model.deleteMany({});
        console.log(`Cleared data from ${modelName}`);
      } catch (error) {
        console.error(`Error clearing data from ${modelName}:`, error);
      }
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
}


async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "users.json",
    "suppliers.json",
    "blockTypes.json",
    "blocks.json",
    "products.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "expenses.json",
    "expenseByCategory.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      await model.create({
        data,
      });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });