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
		{query: `DELETE FROM verification_codes WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM auth_challenges WHERE expires_at < ?`, args: []any{plan.ExpiredBefore}},
		{query: `DELETE FROM auth_challenges WHERE consumed_at IS NOT NULL`, args: nil},
		{query: `DELETE FROM passkey_usage_logs WHERE created_at < ?`, args: []any{plan.PasskeyUsageLogBefore}},
		{query: `DELETE FROM send_logs WHERE channel = 'email' AND created_at < ?`, args: []any{plan.EmailSendLogBefore}},
		{query: `DELETE FROM send_logs WHERE channel = 'sms' AND created_at < ?`, args: []any{plan.PhoneSendLogBefore}},
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
