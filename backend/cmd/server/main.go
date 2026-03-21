package main

import (
	"log"

	"mysso/backend/internal/config"
	httplayer "mysso/backend/internal/http"
)

func main() {
	cfg := config.Default()
	server, err := httplayer.NewServer(cfg)
	if err != nil {
		log.Fatalf("init server: %v", err)
	}

	log.Printf("MySSO listening on %s", cfg.HTTP.Addr)
	if err := server.Run(); err != nil {
		log.Fatalf("run server: %v", err)
	}
}
