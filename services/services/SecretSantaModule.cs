using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Web;
using System.Net.Mail;
using Nancy;
using Nancy.IO;
using Nancy.Responses;
using Simple.Data;
using HttpStatusCode = Nancy.HttpStatusCode;

namespace services
{
    public class SecretSantaModule : NancyModule
    {
        public SecretSantaModule()
        {
            Get["/pickers"] = _ => GetPickers();
            Get["/tickets/{pickerId}"] = _ => GetTickets(_.pickerId);
            Post["/picked/{pickerId}/{ticketId}/{email}"] = _ => AssignTicket(_.pickerId, _.ticketId, _.email);
            Post["/resend/{pickerId}"] = _ => ResendEmail(_.pickerId);
            Get["/"] = _ => new RedirectResponse("/content/index.html", RedirectResponse.RedirectType.Permanent);
        }

        private PickerModel[] GetPickers()
        {
            var allPeople = Database.OpenNamedConnection("db").SecretSanta.All();

            var pickers = new List<PickerModel>();
            foreach (var person in allPeople)
            {
                pickers.Add(new PickerModel
                    {
                        Id = person.Id,
                        Forename = person.Forename,
                        Lastname = person.Lastname,
                        AlreadyPicked = (person.Picked != null)
                    });
            }

            return pickers.OrderBy(p => p.Forename).ToArray();
        }

        private int[] GetTickets(int pickerId)
        {
            var db = Database.OpenNamedConnection("db");
            var picker = db.SecretSanta.FindById(pickerId);
            var allOtherPeople = db.SecretSanta.All(db.SecretSanta.Id != pickerId);

            var allPickedPeopleIds = new List<int>();
            foreach (var p in allOtherPeople)
            {
                if (p.Picked != null)
                {
                    allPickedPeopleIds.Add(p.Picked);
                }
            }

            // If there are enough options (i.e. more than two), then exclude anyone from the
            // same family group
            var ticketIds = new List<int>();
            foreach (var p in allOtherPeople)
            {
                if (!allPickedPeopleIds.Contains(p.Id) && p.FamilyGroup != picker.FamilyGroup && p.Id != pickerId)
                {
                    ticketIds.Add(p.Id);
                }
            }

            if (!ticketIds.Any())
            {
                foreach (var p in allOtherPeople)
                {
                    if (!allPickedPeopleIds.Contains(p.Id) && p.FamilyGroup == picker.FamilyGroup && p.Id != pickerId)
                    {
                        ticketIds.Add(p.Id);
                    }
                }
            }

            // Sort it all randomly
            var random = new Random();
            return ticketIds.OrderBy(r => random.Next()).ToArray();
        }

        private PersonModel AssignTicket(int pickerId, int ticketId, string email)
        {
            var db = Database.OpenNamedConnection("db");
            var pickedPerson = db.SecretSanta.FindById(ticketId);
            var picker = db.SecretSanta.FindById(pickerId);

            db.SecretSanta.UpdateById(Id: pickerId, Picked: ticketId, Email: email);

            SendEmail(email, picker, pickedPerson);

            return new PersonModel
                {
                    Id = pickedPerson.Id,
                    Forename = pickedPerson.Forename,
                    Lastname = pickedPerson.Lastname,
                    Letter = pickedPerson.Letter
                };
        }

        private void SendEmail(string email, dynamic picker, dynamic pickedPerson)
        {
            try
            {
                var mail = new System.Net.Mail.MailMessage("santa@mrsteacakes.com", email);


                if (!string.IsNullOrEmpty(pickedPerson.Letter))
                {
                    mail.Subject = string.Format("{0}, your letter from {1} {2}", picker.Forename, pickedPerson.Forename,
                        pickedPerson.Lastname);
                    mail.Body = pickedPerson.Letter;
                } else {
                    mail.Subject = string.Format("{0}, you picked {1} {2}", picker.Forename, pickedPerson.Forename,
                        pickedPerson.Lastname);
                    mail.Body = string.Format("You picked {0} {1}.  Happy Shopping!", pickedPerson.Forename, pickedPerson.Lastname);
                }
                mail.IsBodyHtml = true;

                var smtpClient = new SmtpClient("smtp.123-reg.co.uk", 25);
                smtpClient.Credentials = new NetworkCredential("kate@mrsteacakes.com", "Tigger09?");

                smtpClient.SendCompleted += smtpClient_SendCompleted;
                smtpClient.SendAsync(mail, null);
            }
            catch (Exception ex)
            {
            }
        }

        private string ResendEmail(int pickerId)
        {
            var db = Database.OpenNamedConnection("db");
            var picker = db.SecretSanta.FindById(pickerId);
            var pickedPerson = db.SecretSanta.FindById(picker.Picked);
            SendEmail(picker.Email, picker, pickedPerson);
            return picker.Email;
        }

        private void smtpClient_SendCompleted(object sender, System.ComponentModel.AsyncCompletedEventArgs e)
        {
        }
    }
}