package geoip

import (
	"errors"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"

	ip2region "github.com/lionsoul2014/ip2region/binding/golang/service"

	"mysso/backend/internal/config"
)

type Location struct {
	Country     string
	Region      string
	City        string
	ISP         string
	CountryCode string
}

type Locator interface {
	Lookup(ip string) (Location, bool)
}

type NoopLocator struct{}

func (NoopLocator) Lookup(string) (Location, bool) {
	return Location{}, false
}

type IP2RegionLocator struct {
	searcher *ip2region.Ip2Region
}

func NewIP2RegionLocator(cfg config.RiskConfig) (Locator, error) {
	v4Path := strings.TrimSpace(cfg.IP2RegionIPv4Path)
	v6Path := strings.TrimSpace(cfg.IP2RegionIPv6Path)
	if v4Path == "" && v6Path == "" {
		return NoopLocator{}, nil
	}
	if v4Path != "" {
		if resolved, ok, err := resolveExistingPath(v4Path); err != nil {
			return nil, fmt.Errorf("stat IPv4 ip2region xdb: %w", err)
		} else if ok {
			v4Path = resolved
		} else {
			v4Path = ""
		}
	}
	if v6Path != "" {
		if resolved, ok, err := resolveExistingPath(v6Path); err != nil {
			return nil, fmt.Errorf("stat IPv6 ip2region xdb: %w", err)
		} else if ok {
			v6Path = resolved
		} else {
			v6Path = ""
		}
	}
	if v4Path == "" && v6Path == "" {
		return NoopLocator{}, nil
	}
	searcher, err := ip2region.NewIp2RegionWithPath(v4Path, v6Path)
	if err != nil {
		return nil, err
	}
	return &IP2RegionLocator{searcher: searcher}, nil
}

func resolveExistingPath(path string) (string, bool, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return "", false, nil
	}
	candidates := []string{path}
	if !filepath.IsAbs(path) {
		candidates = append(candidates, filepath.Join("..", path))
	}
	for _, candidate := range candidates {
		if _, err := os.Stat(candidate); err != nil {
			if errors.Is(err, os.ErrNotExist) {
				continue
			} else {
				return "", false, err
			}
		}
		return candidate, true, nil
	}
	return "", false, nil
}

func (l *IP2RegionLocator) Lookup(ip string) (Location, bool) {
	if l == nil || l.searcher == nil {
		return Location{}, false
	}
	ip = strings.TrimSpace(ip)
	if net.ParseIP(ip) == nil {
		return Location{}, false
	}
	region, err := l.searcher.Search(ip)
	if err != nil || strings.TrimSpace(region) == "" {
		return Location{}, false
	}
	loc := parseRegion(region)
	if loc.Country == "" && loc.CountryCode == "" {
		return Location{}, false
	}
	return loc, true
}

func parseRegion(region string) Location {
	parts := strings.Split(region, "|")
	for len(parts) < 5 {
		parts = append(parts, "")
	}
	return Location{
		Country:     normalizeUnknown(parts[0]),
		Region:      normalizeUnknown(parts[1]),
		City:        normalizeUnknown(parts[2]),
		ISP:         normalizeUnknown(parts[3]),
		CountryCode: strings.ToUpper(normalizeUnknown(parts[4])),
	}
}

func normalizeUnknown(value string) string {
	value = strings.TrimSpace(value)
	if value == "0" {
		return ""
	}
	return value
}
