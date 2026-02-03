export async function up(knex) {
  await knex.schema.createTable('sessions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('ip_address');
    table.string('user_agent');
    table.timestamp('expires_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('user_id');
    table.index('expires_at');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('sessions');
}