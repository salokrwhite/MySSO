package notify

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"time"

	"mysso/backend/internal/config"
)

type Mailer interface {
	Send(to, subject, body string) error
	Enabled() bool
}

type SMTPMailer struct {
	host     string
	port     string
	username string
	password string
	from     string
	forceSSL bool
	timeout  time.Duration
}

type DisabledMailer struct{}

func NewMailer(cfg config.SMTPConfig) Mailer {
	if cfg.Host == "" || cfg.Port == "" || cfg.From == "" {
		return DisabledMailer{}
	}
	return SMTPMailer{
		host:     cfg.Host,
		port:     cfg.Port,
		username: cfg.Username,
		password: cfg.Password,
		from:     cfg.From,
		forceSSL: cfg.ForceSSL,
		timeout:  10 * time.Second,
	}
}

func (m SMTPMailer) Enabled() bool { return true }

func (m SMTPMailer) Send(to, subject, body string) error {
	addr := fmt.Sprintf("%s:%s", m.host, m.port)
	conn, err := net.DialTimeout("tcp", addr, m.timeout)
	if err != nil {
		return err
	}
	defer conn.Close()

	_ = conn.SetDeadline(time.Now().Add(m.timeout))

	clientConn := conn
	if m.forceSSL {
		tlsConn := tls.Client(conn, &tls.Config{ServerName: m.host})
		if err := tlsConn.Handshake(); err != nil {
			return err
		}
		clientConn = tlsConn
	}

	client, err := smtp.NewClient(clientConn, m.host)
	if err != nil {
		return err
	}
	defer client.Close()

	if !m.forceSSL {
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(&tls.Config{ServerName: m.host}); err != nil {
				return err
			}
		}
	}

	if m.username != "" {
		auth := smtp.PlainAuth("", m.username, m.password, m.host)
		if err := client.Auth(auth); err != nil {
			return err
		}
	}

	message := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
		body + "\r\n")
	if err := client.Mail(m.from); err != nil {
		return err
	}
	if err := client.Rcpt(to); err != nil {
		return err
	}
	writer, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := writer.Write(message); err != nil {
		_ = writer.Close()
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}
	return client.Quit()
}

func (DisabledMailer) Send(_, _, _ string) error { return fmt.Errorf("smtp not configured") }

func (DisabledMailer) Enabled() bool { return false }
