const cron = require('node-cron');
const { subDays, startOfDay, endOfDay} = require("date-fns")
const sendEmail = require("./sendEmail")
const ConnectionRequest = require("../models/connectionRequest")

// check who has not responded to their request in 2 days

cron.schedule('0 8 * * *', async () => {
  try{

    const yesterday= subDays(new Date(),1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);
    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      }
    }).populate("toUserId", "firstName emailId");

    const listOfEmails = [...new Set(pendingRequests.map(req => req.toUserId.emailId))]
    for (const email of listOfEmails) {
      // Send Emails
      try {
        const res = await sendEmail.run(
          "New Friend Requests pending for " + email,
          "There are so many frined reuests pending, please login to DevTinder.in and accept or reject the requests."
        );
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    }

  }
  catch (error) {
    console.log(error);
  }

  console.log('Cron job ran: pending request emails sent');
});