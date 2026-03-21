package demo.mysso;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpSession;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class MyssoDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyssoDemoApplication.class, args);
    }
}

@Controller
class OIDCController {
    private final RestTemplate restTemplate = new RestTemplate();

    private final String myssoBase = System.getenv().getOrDefault("MYSSO_BASE", "http://localhost:8080");
    private final String clientId = System.getenv().getOrDefault("MYSSO_CLIENT_ID", "replace-with-client-id");
    private final String clientSecret = System.getenv().getOrDefault("MYSSO_CLIENT_SECRET", "replace-with-client-secret");
    private final String redirectUri = System.getenv().getOrDefault("MYSSO_REDIRECT_URI", "http://localhost:8089/callback");
    private final String scope = System.getenv().getOrDefault("MYSSO_SCOPE", "openid profile email");

    @GetMapping("/")
    public ResponseEntity<String> index() {
        return ResponseEntity.ok("<a href=\"/login\">Use MySSO Login</a>");
    }

    @GetMapping("/login")
    public ResponseEntity<Void> login(HttpSession session) throws Exception {
        String state = randomString();
        String nonce = randomString();
        String verifier = randomString();
        String challenge = createCodeChallenge(verifier);

        session.setAttribute("oidc_state", state);
        session.setAttribute("oidc_nonce", nonce);
        session.setAttribute("oidc_verifier", verifier);

        String authorizeUrl = myssoBase + "/oauth2/authorize" +
            "?client_id=" + encode(clientId) +
            "&redirect_uri=" + encode(redirectUri) +
            "&response_type=code" +
            "&scope=" + encode(scope) +
            "&state=" + encode(state) +
            "&nonce=" + encode(nonce) +
            "&code_challenge=" + encode(challenge) +
            "&code_challenge_method=S256";

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(authorizeUrl));
        return ResponseEntity.status(302).headers(headers).build();
    }

    @GetMapping("/callback")
    public ResponseEntity<?> callback(
        @RequestParam(required = false) String code,
        @RequestParam(required = false) String state,
        @RequestParam(required = false) String error,
        @RequestParam(name = "error_description", required = false) String errorDescription,
        HttpSession session
    ) {
        if (error != null && !error.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", error,
                "error_description", errorDescription == null ? "" : errorDescription
            ));
        }
        if (code == null || state == null || !state.equals(session.getAttribute("oidc_state"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid authorization response"));
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("code", code);
        form.add("redirect_uri", redirectUri);
        form.add("code_verifier", String.valueOf(session.getAttribute("oidc_verifier")));

        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(form, tokenHeaders);
        ResponseEntity<Map> tokenResponse = restTemplate.exchange(
            myssoBase + "/oauth2/token",
            HttpMethod.POST,
            tokenRequest,
            Map.class
        );

        String accessToken = String.valueOf(tokenResponse.getBody().get("access_token"));
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
            myssoBase + "/oauth2/userinfo",
            HttpMethod.GET,
            new HttpEntity<>(userHeaders),
            Map.class
        );

        Map<String, Object> result = new HashMap<>();
        result.put("token", tokenResponse.getBody());
        result.put("userinfo", userInfoResponse.getBody());
        return ResponseEntity.ok(result);
    }

    private String randomString() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String createCodeChallenge(String verifier) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
