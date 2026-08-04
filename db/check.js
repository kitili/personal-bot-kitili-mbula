/**
 * npm run db:check — connect, list tables, insert linked rows, join-read.
 */
const { pool, query } = require("./client");

async function main() {
  console.log("Connecting to database…");

  const tables = await query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log("\nTables:");
  for (const row of tables.rows) {
    console.log(`  - ${row.table_name}`);
  }

  console.log("\nInserting sample user + morning board + todo…");

  const user = await query(
    `INSERT INTO users (name, sparkles)
     VALUES ($1, $2)
     RETURNING id, name, sparkles, created_at`,
    ["Kitili", 3]
  );
  const userId = user.rows[0].id;
  console.log("User:", user.rows[0]);

  const board = await query(
    `INSERT INTO morning_boards (date, want, how, mood, sealed, user_id)
     VALUES (CURRENT_DATE, $1, $2, $3, true, $4)
     RETURNING id, date, want, mood, sealed, user_id`,
    ["Finish Module 6 database assessment", "Sparkly and focused", "sparkly", userId]
  );
  const boardId = board.rows[0].id;
  console.log("Board:", board.rows[0]);

  const todo = await query(
    `INSERT INTO board_todos (text, done, position, board_id)
     VALUES ($1, false, 1, $2)
     RETURNING id, text, done, position, board_id`,
    ["Run npm run db:check", boardId]
  );
  console.log("Todo:", todo.rows[0]);

  const joined = await query(
    `SELECT
       u.name AS user_name,
       u.sparkles,
       b.date AS board_date,
       b.want,
       b.mood,
       t.text AS todo_text,
       t.done AS todo_done,
       t.position
     FROM users u
     JOIN morning_boards b ON b.user_id = u.id
     JOIN board_todos t ON t.board_id = b.id
     WHERE u.id = $1`,
    [userId]
  );

  console.log("\nJoin result:");
  console.table(joined.rows);
  console.log("\n✅ db:check passed — connected, wrote rows, joined them back.");
}

main()
  .catch((err) => {
    console.error("\n❌ db:check failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
