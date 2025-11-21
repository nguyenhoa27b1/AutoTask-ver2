import cron from 'node-cron';
import taskService from '../services/task.service';
import emailService from '../services/email.service';

class CronJobs {
  // Update overdue tasks - runs every 15 minutes
  startUpdateOverdueTasksJob() {
    cron.schedule('*/15 * * * *', async () => {
      try {
        console.log('🔄 Running cron job: Update overdue tasks');
        const count = await taskService.updateOverdueTasks();
        console.log(`✅ Cron job completed: ${count} tasks updated to OVERDUE`);
      } catch (error) {
        console.error('❌ Cron job failed (update overdue tasks):', error);
      }
    });
    console.log('✅ Cron job scheduled: Update overdue tasks (every 15 minutes)');
  }

  // Send deadline reminders - runs daily at 9:00 AM
  startDeadlineReminderJob() {
    cron.schedule('0 9 * * *', async () => {
      try {
        console.log('🔄 Running cron job: Send deadline reminders');
        const tasks = await taskService.getTasksWithUpcomingDeadlines();

        let emailsSent = 0;
        for (const task of tasks) {
          try {
            await emailService.sendDeadlineReminderEmail(
              task.assignedUser.email,
              task.assignedUser.name || task.assignedUser.email,
              task.title,
              task.deadline
            );
            emailsSent++;
          } catch (error) {
            console.error(`Failed to send reminder for task ${task.id}:`, error);
          }
        }

        console.log(`✅ Cron job completed: ${emailsSent} reminder emails sent`);
      } catch (error) {
        console.error('❌ Cron job failed (deadline reminders):', error);
      }
    });
    console.log('✅ Cron job scheduled: Send deadline reminders (daily at 9:00 AM)');
  }

  // Start all cron jobs
  startAll() {
    this.startUpdateOverdueTasksJob();
    this.startDeadlineReminderJob();
    console.log('🚀 All cron jobs started successfully');
  }
}

export default new CronJobs();
