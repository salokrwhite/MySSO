package scopeutil

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/store"
)

func DefaultScopeDefinitions() []domain.ScopeDefinition {
	now := time.Now().UTC()
	return []domain.ScopeDefinition{
		{Key: "openid", DisplayName: "基础登录", Description: "确认用户身份并建立 OIDC 登录会话。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
		{Key: "profile", DisplayName: "公开资料", Description: "允许读取昵称、头像等公开资料。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
		{Key: "email", DisplayName: "邮箱资料", Description: "允许读取账号邮箱地址。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
		{Key: "phone", DisplayName: "手机号资料", Description: "允许读取账号绑定手机号。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
		{Key: "role", DisplayName: "账号角色信息", Description: "允许读取账号当前角色标识，例如 user、developer、admin。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
		{Key: "gateway.read", DisplayName: "网关受保护资源读取", Description: "允许访问系统里受 scope 保护的网关或 API 资源。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
	}
}

func BuiltinScopeDefinition(key string) (domain.ScopeDefinition, bool) {
	for _, item := range DefaultScopeDefinitions() {
		if item.Key == key {
			return item, true
		}
	}
	return domain.ScopeDefinition{}, false
}

func ListScopeDefinitionsWithFallback(dataStore store.Store) []domain.ScopeDefinition {
	items := dataStore.ListScopes()
	if len(items) == 0 {
		items = DefaultScopeDefinitions()
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].System == items[j].System {
			return items[i].Key < items[j].Key
		}
		return items[i].System && !items[j].System
	})
	return items
}

func NormalizeScopeDefinition(input domain.ScopeDefinition, existing *domain.ScopeDefinition) (domain.ScopeDefinition, error) {
	key := strings.ToLower(strings.TrimSpace(input.Key))
	if key == "" {
		return domain.ScopeDefinition{}, fmt.Errorf("scope key is required")
	}
	for _, char := range key {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '.' || char == '_' || char == '-' {
			continue
		}
		return domain.ScopeDefinition{}, fmt.Errorf("scope key contains unsupported characters")
	}

	item := domain.ScopeDefinition{
		Key:                 key,
		DisplayName:         strings.TrimSpace(input.DisplayName),
		Description:         strings.TrimSpace(input.Description),
		Enabled:             input.Enabled,
		DeveloperSelectable: input.DeveloperSelectable,
		System:              input.System,
		UpdatedAt:           time.Now().UTC(),
	}
	if existing != nil {
		item.System = existing.System
	}
	if builtin, ok := BuiltinScopeDefinition(key); ok {
		item.System = true
		if item.DisplayName == "" {
			item.DisplayName = builtin.DisplayName
		}
		if item.Description == "" {
			item.Description = builtin.Description
		}
	}
	if item.DisplayName == "" {
		return domain.ScopeDefinition{}, fmt.Errorf("scope display name is required")
	}
	if item.Description == "" {
		return domain.ScopeDefinition{}, fmt.Errorf("scope description is required")
	}
	if item.Key == "openid" {
		item.Enabled = true
		item.DeveloperSelectable = true
	}
	return item, nil
}

func NormalizeScopeList(scopes []string) []string {
	seen := map[string]struct{}{}
	items := make([]string, 0, len(scopes))
	for _, item := range scopes {
		value := strings.ToLower(strings.TrimSpace(item))
		if value == "" {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		items = append(items, value)
	}
	return items
}
