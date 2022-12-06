// 1
import { PrismaClient } from "@prisma/client";

// 2
const prisma = new PrismaClient();

// 3
async function main() {
  const allDatapoints = await prisma.datapoint.findMany({
    where: { metainfo: { type: "Gas" } },
  });
  console.log(allDatapoints);
}

// 4
main()
  .catch((e) => {
    throw e;
  })
  // 5
  .finally(async () => {
    await prisma.$disconnect();
  });
