export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique();
    table.string('username').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('telegram_id').unique();
    table.enum('role', ['user', 'admin']).defaultTo('user');
    table.boolean('is_active').defaultTo(true);
    table.boolean('two_factor_enabled').defaultTo(false);
    table.text('two_factor_secret');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index('email');
    table.index('telegram_id');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
}