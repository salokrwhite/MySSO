package http

import (
	"bytes"
	"errors"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "golang.org/x/image/webp"
	_ "image/gif"
)

const (
	maxUploadImageBytes        int64 = 5 << 20
	maxUploadMultipartOverhead int64 = 1 << 20
	maxUploadImageWidth              = 2048
	maxUploadImageHeight             = 2048
	maxUploadImagePixels             = 4_000_000
	maxStoredImageBytes        int   = 6 << 20
)

var allowedUploadImageFormats = map[string]struct{}{
	"gif":  {},
	"jpeg": {},
	"png":  {},
	"webp": {},
}

func (s *Server) storeUploadedImage(c *gin.Context, fileField string, filePrefix string) (string, error) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadImageBytes+maxUploadMultipartOverhead)

	fileHeader, err := c.FormFile(fileField)
	if err != nil {
		if isRequestBodyTooLarge(err) {
			return "", errors.New("image file is too large")
		}
		return "", err
	}
	if fileHeader.Size <= 0 {
		return "", errors.New("image file is empty")
	}
	if fileHeader.Size > maxUploadImageBytes {
		return "", errors.New("image file is too large")
	}

	normalizedData, extension, err := normalizeUploadedImage(fileHeader)
	if err != nil {
		return "", err
	}
	if err := os.MkdirAll("uploads", 0755); err != nil {
		return "", err
	}

	filename := filePrefix + "-" + strings.ReplaceAll(uuid.NewString(), "-", "") + extension
	targetPath := filepath.Join("uploads", filename)
	if err := os.WriteFile(targetPath, normalizedData, 0644); err != nil {
		return "", err
	}
	return "/uploads/" + filename, nil
}

func normalizeUploadedImage(fileHeader *multipart.FileHeader) ([]byte, string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, "", err
	}
	defer file.Close()

	data, err := readUploadedImageBytes(file)
	if err != nil {
		return nil, "", err
	}
	return normalizeUploadedImageBytes(data)
}

func normalizeUploadedImageBytes(data []byte) ([]byte, string, error) {
	if len(data) == 0 {
		return nil, "", errors.New("image file is empty")
	}

	if !isAllowedUploadContentType(data) {
		return nil, "", errors.New("unsupported image content type")
	}

	cfg, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return nil, "", errors.New("invalid image file")
	}
	if _, ok := allowedUploadImageFormats[strings.ToLower(strings.TrimSpace(format))]; !ok {
		return nil, "", errors.New("unsupported image format")
	}
	if cfg.Width <= 0 || cfg.Height <= 0 {
		return nil, "", errors.New("invalid image dimensions")
	}
	if cfg.Width > maxUploadImageWidth || cfg.Height > maxUploadImageHeight {
		return nil, "", errors.New("image dimensions exceed limit")
	}
	if cfg.Width*cfg.Height > maxUploadImagePixels {
		return nil, "", errors.New("image resolution exceeds limit")
	}

	if strings.EqualFold(strings.TrimSpace(format), "webp") {
		if len(data) > maxStoredImageBytes {
			return nil, "", errors.New("normalized image is too large")
		}
		return data, ".webp", nil
	}

	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, "", errors.New("invalid image file")
	}

	var output bytes.Buffer
	var extension string
	if hasTransparentPixels(img) {
		encoder := png.Encoder{CompressionLevel: png.BestSpeed}
		if err := encoder.Encode(&output, img); err != nil {
			return nil, "", errors.New("failed to normalize image")
		}
		extension = ".png"
	} else {
		if err := jpeg.Encode(&output, img, &jpeg.Options{Quality: 85}); err != nil {
			return nil, "", errors.New("failed to normalize image")
		}
		extension = ".jpg"
	}
	if output.Len() > maxStoredImageBytes {
		return nil, "", errors.New("normalized image is too large")
	}
	return output.Bytes(), extension, nil
}

func readUploadedImageBytes(file multipart.File) ([]byte, error) {
	limited := io.LimitReader(file, maxUploadImageBytes+1)
	data, err := io.ReadAll(limited)
	if err != nil {
		if isRequestBodyTooLarge(err) {
			return nil, errors.New("image file is too large")
		}
		return nil, err
	}
	if int64(len(data)) > maxUploadImageBytes {
		return nil, errors.New("image file is too large")
	}
	return data, nil
}

func isAllowedUploadContentType(data []byte) bool {
	contentType := http.DetectContentType(data)
	contentType = strings.ToLower(strings.TrimSpace(strings.Split(contentType, ";")[0]))
	switch contentType {
	case "image/gif", "image/jpeg", "image/png", "image/webp":
		return true
	default:
		return isWebPMagic(data)
	}
}

func isWebPMagic(data []byte) bool {
	if len(data) < 12 {
		return false
	}
	return string(data[0:4]) == "RIFF" && string(data[8:12]) == "WEBP"
}

func hasTransparentPixels(img image.Image) bool {
	if opaque, ok := img.(interface{ Opaque() bool }); ok {
		return !opaque.Opaque()
	}
	bounds := img.Bounds()
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			if color.NRGBAModel.Convert(img.At(x, y)).(color.NRGBA).A != 255 {
				return true
			}
		}
	}
	return false
}

func isRequestBodyTooLarge(err error) bool {
	var maxBytesErr *http.MaxBytesError
	return errors.As(err, &maxBytesErr)
}
