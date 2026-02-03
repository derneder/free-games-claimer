export async function up(knex) {
  await knex.schema.createTable('games', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.string('publisher');
    table.string('source').notNullable(); // epic-games, gog, steam, prime-gaming
    table.string('source_url');
    table.enum('platform', ['windows', 'mac', 'linux']).defaultTo('windows');
    table.string('genre');
    table.integer('metacritic_score');
    table.decimal('steam_price_usd', 10, 2);
    table.timestamp('obtained_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'source', 'title']);
    table.index('user_id');
    table.index('source');
    table.index('obtained_at');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('games');
}