import { ensureSeeded } from "../src/db/seed";

ensureSeeded()
  .then(() => {
    console.log("Database seeded.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
