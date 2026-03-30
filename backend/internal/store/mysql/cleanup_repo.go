package mysql

func (s *MySQLStore) CleanupRuntimeData(plan CleanupPlan) error {
	statements := []struct {
		query string
		args  []any
	}{
		{query: `DELETE FROM sessions WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM authorization_codes WHERE used = 1 OR expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM refresh_tokens WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM consents WHERE revoked_at IS NOT NULL AND revoked_at < ?`, args: []any{plan.RevokedConsentBefore}},
		{query: `DELETE FROM email_verification_codes WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM sms_verification_codes WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM rate_limit_counters WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM request_challenges WHERE consumed_at IS NOT NULL OR expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM mfa_login_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM deletion_login_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM passkey_registration_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM passkey_login_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM phone_binding_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM login_step_up_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM login_mfa_enrollment_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM rate_limit_events WHERE created_at < ?`, args: []any{plan.RateLimitEventBefore}},
		{query: `DELETE FROM passkey_usage_logs WHERE created_at < ?`, args: []any{plan.PasskeyUsageLogBefore}},
		{query: `DELETE FROM email_send_logs WHERE created_at < ?`, args: []any{plan.EmailSendLogBefore}},
		{query: `DELETE FROM phone_send_logs WHERE created_at < ?`, args: []any{plan.PhoneSendLogBefore}},
		{query: `DELETE FROM audit_logs WHERE created_at < ?`, args: []any{plan.AuditLogBefore}},
		{query: `DELETE FROM user_operation_logs WHERE created_at < ?`, args: []any{plan.UserOperationLogBefore}},
	}

	for _, stmt := range statements {
		if _, err := s.db.Exec(stmt.query, stmt.args...); err != nil {
			return err
		}
	}
	return nil
}
