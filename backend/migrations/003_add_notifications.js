/**
 * Migration: Add notifications table for admin alerts
 */

export async function up(knex) {
  // Create notifications table
  await knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    
    // Notification metadata
    table.string('type').notNullable(); // user_registered, security_alert, etc
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.string('severity').defaultTo('info'); // info, warning, error, critical
    table.json('metadata').defaultTo('{}');
    
    // Read status
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('type');
    table.index('severity');
    table.index('is_read');
    table.index('created_at');
  });

  console.log('✅ notifications table created');
}

export async function down(knex) {
  // Drop notifications table
  await knex.schema.dropTableIfExists('notifications');
  
  console.log('❌ notifications table dropped');
}
