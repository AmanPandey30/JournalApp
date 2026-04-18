package com.engineerDigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    // ── Plain text email ────────────────────────────────────────────────
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false); // false = plain text
            javaMailSender.send(message);
            log.info("Plain email sent to: {}", to);
        } catch (Exception e) {
            log.error("Exception while sendEmail to {}: {}", to, e.getMessage());
        }
    }

    // ── HTML email ──────────────────────────────────────────────────────
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            javaMailSender.send(message);
            log.info("HTML email sent to: {}", to);
        } catch (Exception e) {
            log.error("Exception while sendHtmlEmail to {}: {}", to, e.getMessage());
        }
    }
}
