const locale = {
  translation: {
    header: {
      language: "Dili değiştir",
      languageModalTitle: "Dil seçimi",
      languageModalDesc: "Kullanmak istediğiniz arayüz dilini seçin.",
      agreement: "Kullanıcı Sözleşmesi",
      privacy: "Gizlilik Politikası",
      help: "Yardım Merkezi",
      logout: "Çıkış yap",
      accountCenter: "Hesap Merkezi",
    },
    legal: {
      back: "Ana sayfaya dön",
      updatedAt: "Son güncelleme: {{date}}",
      agreement: {
        title: "Kullanıcı Sözleşmesi",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}}'e hoş geldiniz. Kayıt olmadan, giriş yapmadan, entegre etmeden veya bu sistemin sağladığı birleşik kimlik doğrulama yeteneğini kullanmadan önce bu sözleşmeyi dikkatlice okuyunuz. Hizmeti kullanmaya devam etmek, bu sözleşme hükümleri uyarınca hizmeti kullanmayı kabul ettiğiniz olarak kabul edilecektir.",
        sections: {
          accountTitle: "1. Hesap ve Giriş",
          accountP1:
            "Gerçek, yasal ve iletilebilir kayıt bilgilerini sağlamalı ve hesabınızı, parolanızı, doğrulama kodlarını ve diğer giriş kimlik bilgilerini uygun şekilde korumalısınız. Kendi tarafınızdaki yetersiz belge yönetiminden kaynaklanan kayıplar için sorumlu olacaksınız.",
          accountP2:
            "Anormal giriş etkinliği, kural ihlalleri, hesap dondurulması veya güvenlik riskleri tespit edilirse, platform güvenlik amaçlarıyla ek doğrulama, giriş kısıtlaması veya erişimi askıya alma gibi işlemler yapabilir.",
          acceptableUseTitle: "2. Kabul Edilebilir Kullanım",
          acceptableUseP1:
            "Bu sistemi yasadışı faaliyetler, hak ihlalleri, kimlik doğrulama arayüzlerinin kötüye kullanımı, toplu istekler, parola doldurma veya platformun kararlılığını tehdit eden veya güvenlik kontrollerini aşan herhangi bir davranış için kullanmamalısınız.",
          acceptableUseP2:
            "Bu sözleşmeyi veya ilgili kuralları ihlal ederseniz, platform erişiminizin bir kısmını veya tamamını askıya alabilir veya sonlandırabilir ve gerektiğinde sorumluluğu takip etme hakkını saklayacaktır.",
          authorizationTitle: "3. Yetkilendirme ve Üçüncü Parti Uygulamaları",
          authorizationP1:
            "Üçüncü parti bir uygulamada {{siteName}} hesabınızı kullanarak giriş yaptığınızda, sistem yetkilendirme sayfasında görüntülenen izinler temel alınarak onayınızı isteyecektir. Reddedebilir veya hesab merkezinde herhangi bir zamanda bu onayı iptal edebilirsiniz.",
          authorizationP2:
            "Yetkilendirmeden sonra üçüncü parti uygulamanın verilerinizi kullanması, o uygulamanın kendi hizmet şartları ve gizlilik politikası tarafından yönetilecektir. Platform yalnızca yasal olarak gereken kapsamda sorumluluk alacaktır.",
          developerTitle: "4. Geliştirici Entegrasyonu",
          developerP1:
            "Geliştiriciler, uygulama bilgilerinin, yeniden yönlendirme URI'lerinin, istenen kapsamların ve iş amaçlarının gerçek, tam ve sürekli olarak geçerli olduğunu doğrulamalı ve kullanıcıları yanıltmamalıdır.",
          developerP2:
            "Platform, birleşik kimlik ekosisteminin güvenliğini ve bütünlüğünü korumak için entegre uygulamaları gözden geçirebilir, reddedebilir, listeden çıkarabilir, silebilir veya kısıtlayabilir.",
          liabilityTitle: "5. Hizmet Değişiklikleri ve Sorumluluk Sınırlamaları",
          liabilityP1:
            "Güvenlik, uyumluluk, operasyonel veya bakım nedenleriyle, platform belirli arayüzleri, akışları veya işlevleri ayarlayabilir, yükseltebilir, askıya alabilir veya sonlandırabilir ve uygun olduğunda bildirimde bulunmaya çalışacaktır.",
          liabilityP2:
            "Yasalarca izin verilen ölçüde, platform, doğal afetler, ağ arızaları, üçüncü taraf nedenleri veya tarafınızdaki kullanım hatası nedeniyle oluşan kesintiler, anormal veriler veya kayıplar için yasal yükümlülüklerinden öteye geçen sorumluluk kabul etmeyecektir.",
        },
      },
      privacy: {
        title: "Gizlilik Politikası",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}}, kişisel bilgilerinize ve hesap güvenliğinize önem verir. Bu politika, bilgilerinizi nasıl topladığımız, kullandığımız, depoladığımız, paylaştığımız ve koruduğumuzun yanı sıra sahip olduğunuz hakları açıklar.",
        sections: {
          dataCollectionTitle: "1. Topladığımız Bilgiler",
          dataCollectionP1:
            "Kayıt olduğunuzda, giriş yaptığınızda veya hesap hizmetlerini kullandığınızda, kayıt ülkesi, e-posta adresi, telefon numarası, parola karma, giriş oturumları, cihaz IP'si, yetkilendirme kayıtları ve gerekli güvenlik günlüklerini toplamayabiliriz.",
          dataCollectionP2:
            "Avatar yüklediğinizde, profili değiştirdiğinizde, telefon numarasını bağladığınızda, MFA'yi etkinleştirdiğinizde veya üçüncü parti bir uygulamaya yetkilendirdiğinizde, o işlevi sağlamak için gerekli şekilde gönderdiğiniz bilgileri işleyeceğiz.",
          dataUsageTitle: "2. Bilgileri Nasıl Kullanırız",
          dataUsageP1:
            "Hesap kaydı, giriş kimlik doğrulama, doğrulama kodu teslimatı, risk kontrolü, yetkilendirme onayı, geliştirici uygulaması incelemesi, hesap güvenliği bildirimleri ve hizmet güvenilirliği bakımı gibi hizmetleri sağlamak için ilgili bilgileri kullanırız.",
          dataUsageP2:
            "Ayrıca, anormal davranışları tespit etmek, ürün deneyimini iyileştirmek ve güvenliği güçlendirmek için minimum gerekli düzeyde günlükleri ve istatistiksel bilgileri analiz ederiz.",
          dataSharingTitle: "3. Paylaşma ve Açıklama",
          dataSharingP1:
            "Yetkilendirme sayfasında görüntülenen kapsamları açıkça yetkilendirdiğinizda만 üçüncü parti uygulamalara kimlik bilgileri veya izinle ilgili veriler sağlayacağız.",
          dataSharingP2:
            "Yasal zorunluluklar, denetim otoritesi talepleri, kamu yararını koruma veya sistem güvenliği gereksinimleri dışında, kişisel bilgilerinizi ilgisiz üçüncü taraflarla satmayacağız veya yasadışı şekilde paylaşmayacağız.",
          userRightsTitle: "4. Haklarınız",
          userRightsP1:
            "Hesap merkezinde profil, bağlamalar, yetkilendirme kayıtları ve güvenlik ayarlarını görüntüleyebilir ve güncelleyebilir, uygulamalar için izinleri iptal edebilir veya hesap silme isteği gönderebilirsiniz.",
          userRightsP2:
            "Bilgilerinizin yanlış olduğunu, hatalı işlendiğini veya gereğinden fazla kullanıldığını düşünüyorsanız, platform operatörü ile iletişim kurabilir veya geçerli yasa kapsamında haklarınızı kullanabilirsiniz.",
          securityTitle: "5. Koruma ve Saklama",
          securityP1:
            "Kişisel bilgilerinizi ve kimlik doğrulama verilerinizi korumak için erişim kontrolleri, parola karma, doğrulama kodu sona ermesi, denetim günlükleri ve veri minimize etme önlemlerini kullanırız.",
          securityP2:
            "Yasal ve iş gereksinimlerine uygun olarak, hizmet amacını gerçekleştirmek için gereken süre boyunca yalnızca bilgilerinizi saklayacağız; hesap silindikten veya saklama süreleri dolduktan sonra, politika göre verileri sileriz veya anonim hale getiririz.",
        },
      },
    },
    auth: {
      noAccount: "Hesabınız yok mu?",
      registerNow: "Şimdi kaydolun",
      registerPageTitle: "Kullanıcı Kaydı",
      registerPageSubtitle: "Sadece ülke, e-posta ve e-posta doğrulama kodu ile kaydı tamamlayabilirsiniz.",
      registerDisabled: "Şu anda sistem kayıt işlemlerini izin vermiyor",
      registerSuccess: "Kayıt başarıyla tamamlandı. Lütfen parolanızı kullanarak giriş yapın.",
      phoneBindingRequiredAfterRegister: "Kayıt başarıyla tamamlandı. Hesabı etkinleştirmek için önce telefon numaranızı bağlamalısınız.",
      registerFailed: "Kayıt işlemi başarısız",
      country: "Ülke",
      countryRequired: "Lütfen bir ülke seçin",
      registerCode: "E-posta Doğrulama Kodu",
      registerCodeRequired: "Lütfen e-posta doğrulama kodunu girin",
      registerCodePlaceholder: "6 haneli kodu girin",
      sendRegisterCode: "Doğrulama Kodu Gönder",
      sendRegisterCodeSuccess: "Doğrulama kodu gönderildi. Lütfen e-postanızı kontrol edin.",
      sendRegisterCodeFailed: "Doğrulama kodu gönderilemedi",
      backToLoginWithAccount: "Hesabınız var mı? Giriş yapın",
      forgotPassword: "Parolamı unuttum",
      forgotPasswordPageTitle: "Parolayı Sıfırla",
      forgotPasswordPageSubtitle: "Kayıtlı e-posta ve e-posta doğrulama kodu ile giriş parolasını sıfırlayın.",
      forgotPasswordPrompt: "Parolanızı mı unuttunuz?",
      forgotPasswordAction: "Kurtarın",
      forgotPasswordDesc:
        "E-postanızı kodu ile doğruladıktan sonra, doğrudan yeni bir giriş parolası ayarlayabilirsiniz.",
      forgotPasswordHint:
        "Kayıtlı e-postanızı, doğrulama kodunuzu ve yeni parolanızı girin, gönderdikten sonra yeni parolayı kullanarak doğrudan giriş yapabilirsiniz.",
      goToOtpLogin: "E-posta Doğrulama Kodu Girişine Git",
      resetCode: "Kurtarma Kodu",
      sendResetCode: "Kurtarma Kodu Gönder",
      sendResetCodeSuccess: "Kurtarma kodu gönderildi. Lütfen e-postanızı kontrol edin.",
      sendResetCodeFailed: "Kurtarma kodu gönderilemedi",
      resetPassword: "Parolayı Sıfırla",
      resetPasswordSuccess: "Parola başarıyla sıfırlandı. Lütfen yeni parolanızı kullanarak giriş yapın.",
      resetPasswordFailed: "Parola sıfırlanamadı",
      newPassword: "Yeni Parola",
      confirmNewPassword: "Yeni Parolayı Onayla",
      newPasswordPlaceholder: "En az 8 karakterlik bir parola girin",
      confirmPassword: "Parolayı Onayla",
      confirmPasswordPlaceholder: "Parolayı tekrar girin",
      backToLogin: "Giriş Sayfasına Geri Dön",
      emailRequired: "Lütfen e-posta girin",
      passwordRequired: "Lütfen parola girin",
      otpCodeRequired: "Lütfen e-posta doğrulama kodunu girin",
      phoneRequired: "Lütfen telefon numarası girin",
      phoneOtpCodeRequired: "Lütfen SMS doğrulama kodunu girin",
      emailInvalid: "E-posta formatı geçersiz",
      resetCodeRequired: "Lütfen kurtarma kodunu girin",
      resetCodePlaceholder: "6 haneli kodu girin",
      newPasswordRequired: "Lütfen yeni parola girin",
      confirmNewPasswordRequired: "Lütfen yeni parolayı tekrar girin",
      newPasswordMinLength: "Yeni parola en az 8 karakter olmalıdır",
      passwordMinLength: "Parola en az 8 karakter olmalıdır",
      newPasswordMismatch: "İki yeni parola eşleşmiyor",
      passwordMismatch: "İki parola eşleşmiyor",
      registrationClosed: "Şu anda sistem kayıtlarını açıklamıyor",
      login: "Giriş yap",
      passkeyLogin: "Passkey",
      passkeyLoginDesc: "Bu siteye cihazınızda veya sistem hesabınızda zaten bağlı olan bir passkey kullanın.",
      passkeyLoginButton: "Passkey Kullan",
      passkeyLoginHint: "Bunu burada kullanmadan önce hesap merkezinde bir passkey bağlamalısınız.",
      passkeyLoginSuccess: "Passkey başarıyla eklendi",
      passkeyNotAvailable:
        "Bu cihazda bu site için passkey bulunmamaktadır. Başka bir giriş yöntemi kullanın.",
      passwordLogin: "Parola",
      otpLogin: "E-posta Kodu",
      phoneOtpLogin: "Telefon Kodu",
      email: "E-posta",
      phone: "Telefon Numarası",
      password: "Parola",
      otpCode: "E-posta Kodu",
      phoneOtpCode: "SMS Kodu",
      mfaCode: "2FA Kodu",
      mfaPlaceholder: "İki faktörlü doğrulama etkin değilse boş bırakın",
      sendOtpCode: "E-posta Kodu Gönder",
      sendOtpCodeSuccess: "E-posta kodu gönderildi. Lütfen e-postanızı kontrol edin.",
      sendOtpCodeFailed: "Doğrulama kodu gönderilemedi",
      sendOtpCodeEmailRequired: "Kod istemeden önce lütfen e-posta girin",
      sendPhoneOtpCode: "SMS Kodu Gönder",
      sendPhoneOtpCodeSuccess: "SMS kodu gönderildi. Lütfen telefonunuzu kontrol edin.",
      sendPhoneOtpCodeFailed: "SMS kodu gönderilemedi",
      sendPhoneBindingCode: "Bağlama Kodu Gönder",
      sendPhoneBindingCodeSuccess: "Telefon bağlama kodu gönderildi. Lütfen telefonunuzu kontrol edin.",
      sendPhoneBindingCodeFailed: "Telefon bağlama kodu gönderilemedi",
      securityCaptcha: "Güvenlik Doğrulaması",
      securityCaptchaPlaceholder: "Güvenlik doğrulama değerini girin ve yeniden deneyin",
      securityCaptchaHelp:
        "Mevcut cihaz veya IP çok sık istek gönderdiğinde, başka bir kod istemeden önce bu güvenlik doğrulamasını tamamlamanız gerekmektedir.",
      securityCaptchaRequiredTip:
        "İstek hacmi yüksek. Başka bir kod istemeden önce güvenlik doğrulamasını tamamlayın.",
      sendOtpCodePhoneRequired: "Kod istemeden önce lütfen telefon numarası girin",
      phoneBindingPageTitle: "Telefon Numarasını Bağla",
      phoneBindingRegisterDesc:
        "Bu hesap kayıttan hemen sonra bağlama risk kuralını tetikledi. Devam etmeden önce telefon numaranızı bağlamalısınız.",
      phoneBindingLoginDesc:
        "Bu hesap giriş risk kuralını tetikledi. Devam etmeden önce telefon numaranızı bağlamalısınız.",
      completePhoneBinding: "Bağlamayı Tamamla ve Devam Et",
      phoneBindingSuccess: "Telefon numarası başarıyla bağlandı. Hesap tekrar normal durumda.",
      mfaVerifyTitle: "İki Faktörlü Doğrulama",
      mfaVerifyEmailHint: "Kod {{target}}'a gönderildi, giriş yapmaya devam etmek için girin.",
      mfaVerifyPhoneHint: "Kod {{target}}'a gönderildi, giriş yapmaya devam etmek için girin.",
      loginStepUpTitle: "Giriş Ek Doğrulaması",
      loginStepUpEmailDesc:
        "Bu hesabın bu girişi için ek e-posta doğrulaması gerekiyor. Kod {{email}}'a gönderilecektir.",
      loginStepUpSMSDesc:
        "Bu hesabın bu girişi için ek telefon doğrulaması gerekiyor. Kod {{phone}}'a gönderilecektir.",
      loginStepUpDualDesc:
        "Bu hesabın bu girişi için hem e-posta hem de telefon doğrulaması gerekiyor. E-posta: {{email}}, telefon: {{phone}}.",
      loginStepUpExpired: "Giriş ek doğrulaması süresi doldu. Lütfen tekrar giriş yapın",
      forcedMfaEnrollmentTitle: "Öncelikle iki faktörlü doğrulama etkinleştirilmelidir",
      forcedMfaEnrollmentDesc:
        "Yönetici, bu giriş tamamlanmadan önce bu hesap için iki faktörlü doğrulama etkinleştirilmesini gerektiriyor. Tamamlandıktan sonra sisteme giriş yapabilirsiniz.",
      forcedMfaEnrollmentExpired: "Zorunlu MFA kayıt oturumu süresi doldu. Lütfen tekrar giriş yapın",
      completeForcedMfaEnrollment: "Etkinleştir ve Girişe Devam Et",
      cancelForcedMfaEnrollment: "İptal Et ve Giriş Sayfasına Dön",
      verifyAndLogin: "Doğrula ve Giriş Yap",
      deletionConfirmTitle: "Hesap Silme İsteği Gönderildi",
      deletionConfirmScheduledAt: "Mevcut hesabın planlanan silme zamanı {{date}}.",
      deletionConfirmDesc:
        "Devam edip giriş yaparsanız, sistem mevcut silme işlemini iptal edecek ve hesabı normal kullanıma geri yükleyecektir.",
      deletionConfirmContinue: "Giriş Yap ve Silme İşlemini İptal Et",
      deletionConfirmExpired: "Giriş onayı süresi doldu, lütfen tekrar giriş yapın",
      deletionConfirmFailed: "Giriş onayı başarısız oldu, lütfen tekrar giriş yapın",
      logoutProgressTitle: "Çıkış yapılıyor",
      logoutProgressDesc: "Kimlik merkezi oturumu temizlendi ve entegre edilmiş iş uygulamalarından eşzamanlı olarak çıkılıyor.",
      loginFailed: "Giriş başarısız",
      oidcCallbackFailed: "OIDC Çağrısı Başarısız",
      appRejected: "Uygulama Reddedildi",
      appRejectedWithReason: "Uygulama Reddedildi: {{reason}}",
      appNotFound: "Uygulama Bulunamadı",
      accessDenied: "Erişim Reddedildi",
      tokenExchangeFailed: "Jetont Değişimi Başarısız",
      authorize: {
        title: "{{appName}}'e giriş yapmak için {{siteName}} kullanın",
        desc: "Bu uygulama aşağıdaki bilgileri ve izinleri talep ediyor. Onayladıktan sonra, girişini tamamlamak için iş sistemine yönlendirileceksiniz.",
        chooseAccountTitle: "Zaten {{siteName}}'e giriş yaptınız",
        chooseAccountDesc:
          "Mevcut hesabı kullanarak yetkilendirme ile devam edip etmemek veya önce farklı bir hesapla giriş yapıp yapmamayı seçin.",
        currentAccountFallback: "Mevcut hesap",
        useCurrentAccount: "Bu hesapla devam et",
        useAnotherAccount: "Başka bir hesapla giriş yap",
        permissionTitle: "Talep Edilen İzinler",
        permissionCount: "{{count}} öğe",
        agreement: "Yukarıda listelenen izinlerin verilmesini okudum ve onaylıyorum",
        confirm: "Onayla ve Devam Et",
        cancel: "İptal Et ve Giriş Sayfasına Dön",
        scopes: {
          openidTitle: "Kimliğinizi doğrulayın",
          openidDesc:
            "Mevcut giriş yapan hesabın sizin olduğunuzu doğrulamak ve temel giriş oturumu oluşturmak için kullanılır.",
          profileTitle: "Kamu profilinize erişin",
          profileDesc:
            "Uygulama içi sunum için görüntü adı, avatar ve benzer kamup rofil verilerini içerir.",
          emailTitle: "E-posta bilgilerine erişin",
          emailDesc:
            "Hesap e-postasını göstermek veya gerekli olduğunda bildirimler ve hesap bağlama için kullanılır.",
          phoneTitle: "Telefon numaranıza erişin",
          phoneDesc:
            "Gerekli olduğunda hesap tanıma, bildirimler veya güvenlik doğrulaması için kullanılır.",
          gatewayReadTitle: "Korunan iş API'lerine erişin",
          gatewayReadDesc:
            "Uygulamanın yetkilendirilmiş kimliğiniz olarak korunan kaynaklara erişmesine izin verir.",
          customTitle: "İzin Talep Ediliyor: {{scope}}",
          customDesc:
            "Bu uygulama ek bir iş izni talep ediyor. Devam etmeden önce dikkatlice gözden geçirin.",
        },
      },
      sessionConflict: {
        title: "Bu tarayıcıda farklı hesaplar tespit edildi",
        desc: "Bu pencere tarafından hatırlanan hesap, tarayıcının şu anda etkin olan hesapla eşleşmiyor. Aynı tarayıcıda aynı anda yalnızca bir ana hesap aktif kalabilir. Devam edeceğiniz hesabı seçin.",
        browserAccount: "Tarayıcı etkin hesabı",
        thisWindowAccount: "Bu pencerenin önceki hesabı",
        useBrowserAccount: "Tarayıcı etkin hesabını kullan",
        useThisWindowAccount: "Bu pencerenin hesabına geri dön",
        relogin: "Çıkış yap ve yeniden giriş yap",
      },
    },
    nav: {
      security: "Giriş & Güvenlik",
      profile: "Profil",
      privacy: "Gizlilik Merkezi",
      bindings: "Yetkilendirilmiş Uygulamalar",
      help: "Yardım Merkezi",
    },
    common: {
      loadingFailed: "Yüklenme başarısız",
      revokeFailed: "İzin iptali başarısız",
      revokeSuccess: "İzin iptal edildi",
      confirm: "Onayla",
      sendCode: "Kod Gönder",
      sendCodeSuccess: "Doğrulama kodu başarıyla gönderildi",
      sendingCode: "Gönderiliyor",
      save: "Kaydet",
      saving: "Kaydediliyor",
      edit: "Düzenle",
      cancel: "İptal Et",
      uploadAvatar: "Avatar Yükle",
      avatarUpdated: "Avatar güncellendi",
      avatarUploadFailed: "Avatar yükleme başarısız",
      profileUpdated: "Profil güncellendi",
      profileUpdateFailed: "Profil güncelleme başarısız",
      imageReadFailed: "Görüntü okuma başarısız",
      imageProcessUnsupported:
        "Bu tarayıcıda görüntü işleme desteklenmiyor",
      avatarConvertFailed: "Avatar dönüştürme başarısız",
      unset: "Ayarlanmadı",
      unsetShort: "Ayarlanmadı",
      notFilled: "Doldurulmadı",
      noRecord: "Kayıt yok",
      normal: "Aktif",
      accountCenter: "Hesap Merkezi",
      noAuthorizedApps: "Yetkilendirilmiş uygulama yok",
    },
    errors: {
      emailRequiredByServer: "Lütfen e-posta girin",
      passwordRequiredByServer: "Lütfen parola girin",
      invalidCredentials: "Hesap veya kimlik bilgileri geçersiz",
      invalidOtpCode: "Doğrulama kodu geçersiz veya süresi dolmuş",
      accountFrozen: "Bu hesap dondurulmuştur",
      accountFrozenWithReason:
        "Bu hesap dondurulmuştur. Nedeni: {{reason}}",
      userNotFound: "Kullanıcı bulunamadı",
      smsNotConfigured: "SMS gönderme işlevi yapılandırılmamış",
      smtpNotConfigured: "E-posta gönderme işlevi yapılandırılmamış",
      userStatusInvalid:
        "Mevcut hesap durumu bu işlemi izin vermiyor",
      invalidCurrentPhoneVerificationCode:
        "Mevcut telefon doğrulama kodu geçersiz veya süresi dolmuş",
      invalidNewPhoneVerificationCode:
        "Yeni telefon doğrulama kodu geçersiz veya süresi dolmuş",
      currentPhoneVerificationCodeRequired:
        "Lütfen mevcut telefon doğrulama kodunu girin",
      currentPhoneNotBound:
        "Bu hesapla şu anda hiçbir telefon numarası bağlanmamış",
      phoneDoesNotMatchCurrentBoundPhone:
        "Telefon numarası mevcut bağlı numara ile eşleşmiyor",
      phoneAlreadyBound: "Bu telefon numarası zaten bağlanmış",
      newPhoneMustBeDifferent:
        "Yeni telefon numarası mevcut numaradan farklı olmalıdır",
      phoneAndVerificationCodeRequired:
        "Lütfen telefon numarası ve yeni telefon doğrulama kodunu girin",
      invalidMfaCode: "İki faktörlü doğrulama kodu geçersiz veya süresi dolmuş",
      unsupportedMfaMethod: "Desteklenmeyen iki faktörlü doğrulama yöntemi",
      mfaNotEnabled:
        "Bu hesap için iki faktörlü doğrulama etkin değil",
      emailNotBound: "Bu hesapla hiçbir e-posta bağlanmamış",
      phoneNotBound: "Bu hesapla hiçbir telefon numarası bağlanmamış",
      emailVerificationCodeRequired: "Lütfen e-posta doğrulama kodunu girin",
      invalidEmailVerificationCode:
        "E-posta doğrulama kodu geçersiz veya süresi dolmuş",
      phoneVerificationCodeRequired: "Lütfen telefon doğrulama kodunu girin",
      invalidPhoneVerificationCode:
        "Telefon doğrulama kodu geçersiz veya süresi dolmuş",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Yeni parola mevcut paroladan farklı olmalıdır",
      phoneBindingChallengeExpired:
        "Telefon bağlama oturumu süresi doldu. Lütfen tekrar giriş yapın veya kaydolun.",
      manualMfaCodeNotSendable:
        "Bu hesap manuel MFA kodu kullanıyor ve kod gönderilemiyor",
      emailAndPasswordRequired:
        "İki faktörlü kod istemeden önce lütfen e-posta ve parola girin",
      mfaChallengeExpiredOrInvalid:
        "İki faktörlü doğrulama oturumu süresi doldu. Lütfen tekrar giriş yapın.",
      challengeRequired:
        "Kod istemeden önce güvenlik zorluğunu tamamlayın.",
      captchaRequired:
        "İstek hacmi yüksek. Önce güvenlik doğrulamasını tamamlayın.",
      rateLimitExceeded: "Çok fazla istek. Lütfen daha sonra yeniden deneyin.",
      circuitOpen:
        "Teslimat kanalı geçici olarak korunuyor. Lütfen daha sonra yeniden deneyin.",
      cooldownActive:
        "Bu hedef çok sık kod istemektedir. Lütfen daha sonra yeniden deneyin.",
      passkeyChallengeExpired: "Passkey oturumu süresi doldu. Lütfen yeniden deneyin.",
      passkeyVerificationFailed:
        "Passkey doğrulaması başarısız. Yeniden deneyin veya başka bir giriş yöntemi kullanın.",
      passkeyAlreadyExists: "Bu passkey zaten bağlanmış.",
      passkeyNotFound: "Passkey bulunamadı.",
      passkeyBrowserUnsupported:
        "Bu tarayıcı veya cihaz passkey'leri desteklemiyor.",
      passkeyUserHandleInvalid:
        "Bu passkey için hesabı tanımlayamıyorum.",
      invalidLoginStepUpVerificationCode:
        "Ek doğrulama kodu geçersiz veya süresi dolmuş.",
      loginStepUpChallengeExpiredOrInvalid:
        "Ek doğrulama oturumu süresi doldu. Lütfen tekrar giriş yapın.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Zorunlu MFA kayıt oturumu süresi doldu. Lütfen tekrar giriş yapın.",
      noAvailableMfaMethodForCurrentAccount:
        "Bu hesap için hiçbir MFA yöntemi mevcut değil.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Bu hesap için hiçbir ek doğrulama hedefi mevcut değil.",
    },
    security: {
      loginMethods: "Giriş Yöntemleri",
      phone: "Telefon Numarasını Bağla",
      phoneDesc:
        "Ek giriş yöntemleri, SMS doğrulaması ve hesap güvenliği bildirimleri için kullanılır",
      bindPhone: "Bağla",
      bindPhoneTitle: "Telefon Numarasını Bağla",
      bindPhoneHint:
        "Bağlamadan önce telefon numarasını doğrulayın. Doğrulama kodu bu telefon numarasına gönderilecektir.",
      rebindPhoneHint:
        "Bağlı telefon numarasını değiştirmek için önce mevcut telefon numarasını doğrulayın, ardından yeni olanı doğrulayın.",
      currentPhone: "Şu Anda Bağlı Telefon Numarası",
      currentPhoneCode: "Mevcut Telefon Doğrulama Kodu",
      currentPhoneCodePlaceholder:
        "Mevcut telefon numarasına gönderilen 6 haneli kodu girin",
      sendCurrentPhoneCode: "Mevcut Telefon Kodu Gönder",
      newPhone: "Telefon Numarası",
      newPhoneCode: "Yeni Telefon Doğrulama Kodu",
      newPhonePlaceholder: "Telefon numarası girin, örneğin 13800138000",
      smsCode: "SMS Doğrulama Kodu",
      smsCodePlaceholder: "6 haneli SMS kodunu girin",
      safeEmail: "Güvenli E-posta",
      safeEmailDesc: "Giriş için kullanılan ana kimlik bilgisi",
      editEmailTitle: "Güvenli E-postayı Değiştir",
      newEmail: "Yeni E-posta",
      newEmailPlaceholder: "Yeni e-posta adresini girin",
      emailCode: "E-posta Kodu",
      emailCodePlaceholder: "6 haneli kodu girin",
      changeEmailHint:
        "Değişiklik kaydedilmeden önce yeni e-posta doğrulanmalıdır.",
      changePassword: "Parolayı Değiştir",
      changePasswordDesc:
        "Hesap güvenliğini artırmak için giriş parolasını düzenli olarak güncelleyin",
      editPasswordTitle: "Giriş Parolasını Değiştir",
      currentPassword: "Mevcut Parola",
      currentPasswordPlaceholder: "Mevcut parolanızı girin",
      currentPasswordIncorrect: "Mevcut parola yanlış",
      newPassword: "Yeni Parola",
      newPasswordPlaceholder: "En az 8 karakterlik yeni bir parola girin",
      confirmPassword: "Yeni Parolayı Onayla",
      confirmPasswordPlaceholder: "Yeni parolayı tekrar girin",
      changePasswordHint:
        "Bir sonraki girişte yeni parolayı kullanın ve eski parolayı yeniden kullanmaktan kaçının.",
      passwordMinLength: "Parola en az 8 karakter olmalıdır",
      passwordMismatch: "İki yeni parola eşleşmiyor",
      passwordUpdated: "Parola güncellendi",
      passwordUpdateFailed: "Parola güncelleme başarısız",
      mfa: "İki Faktörlü Doğrulama",
      mfaDesc: "Etkinleştirildiğinde, giriş sırasında ek doğrulama gereklidir",
      mfaTitle: "İki Faktörlü Doğrulamayı Yapılandırın",
      mfaHint: "Etkinleştirdikten sonra, giriş sırasında kullanılacak ikinci doğrulama yöntemini seçin.",
      mfaTitleEnable: "İki Faktörlü Doğrulamayı Etkinleştir",
      mfaTitleDisable: "İki Faktörlü Doğrulamayı Devre Dışı Bırak",
      mfaHintEnable:
        "Etkinleştirdikten sonra, giriş sırasında kullanılacak ikinci doğrulama yöntemini seçin.",
      mfaHintDisable:
        "Devre dışı bıraktıktan sonra, giriş sırasında ek doğrulama gerekli olmayacaktır.",
      mfaMethod: "Doğrulama Yöntemi",
      mfaMethodEmail: "E-posta Kodu",
      mfaMethodSMS: "Telefon Kodu",
      passkeys: "Passkey'ler",
      passkeysDesc:
        "Bağlandıktan sonra, sistem passkey seçicisinden doğrudan giriş yapabilirsiniz.",
      addPasskey: "Passkey Ekle",
      deletePasskey: "Passkey Sil",
      passkeyName: "Cihaz Adı",
      passkeyNamePlaceholder: "Tanımlanabilir bir ad girin",
      passkeyLastUsed: "Son Kullanım",
      passkeyLastUsedIP: "Son Kullanılan IP",
      passkeyCreatedAt: "Oluşturulma Zamanı",
      passkeyEmpty: "Bağlı passkey yok",
      passkeyManageVerify:
        "Hesabınızı korumak için, bir passkey eklemeden veya silmeden önce mevcut kimlik bilgilerinizi doğrulayın.",
      currentMfaCode: "Mevcut MFA Kodu",
      currentMfaCodePlaceholder: "Mevcut MFA yönteminden kodu girin",
      currentMfaCodeHintEmail:
        "Kaydetmeden önce mevcut bağlı e-posta kodu ile doğrulamayı tamamlayın.",
      currentMfaCodeHintSMS:
        "Kaydetmeden önce mevcut bağlı telefon kodu ile doğrulamayı tamamlayın.",
      currentMfaCodeHintManual:
        "Kaydetmeden önce şu anda yapılandırılan manuel MFA kodunu girin.",
      accountSecurity: "Hesap Güvenliği",
      recentLogin: "Son Giriş",
      recentLoginDesc: "Son başarılı giriş zamanı ve cihaz IP'si",
    },
    profile: {
      title: "Profil",
      avatar: "Avatar",
      avatarDesc:
        "Yüklendikten sonra otomatik olarak merkezi kesilir ve webp formatına dönüştürülür",
      nickname: "Kullanıcı Adı",
      nicknameDesc: "Mevcut görüntü adı",
      gender: "Cinsiyet",
      genderDesc: "Bu hesap için profil cinsiyet bilgisi",
      languagePreference: "Dil Tercihi",
      languagePreferenceDesc:
        "Giriş yaptıktan sonra, sayfa içeriği için bu dil önce kullanılır",
      languagePreferenceSaved: "Dil tercihi kaydedildi",
      languagePreferenceSaveFailed: "Dil tercihi kaydedilemedi",
      genderMale: "Erkek",
      genderFemale: "Kadın",
      genderOther: "Diğer",
      userId: "Kullanıcı ID",
      userIdDesc: "Sistemde mevcut hesabı benzersiz şekilde tanımlamak için kullanılır",
      nicknamePlaceholder: "Kullanıcı adını girin",
      editNicknameTitle: "Kullanıcı Adını Düzenle",
      editGenderTitle: "Cinsiyeti Düzenle",
      email: "E-posta Adresi",
      emailDesc: "Giriş, doğrulama ve güvenlik bildirimleri için kullanılır",
      createdAt: "Kayıt Tarihi",
      createdAtDesc: "Bu hesabın oluşturulma zamanı",
      country: "Kayıt Ülkes",
      countryDesc: "Kayıt sırasında kaydedilen ülke veya bölge",
    },
    privacy: {
      title: "Gizlilik Merkezi",
      exportTitle: "Kullanıcı Verilerini İndir",
      exportDesc:
        "Profil verilerini ve iptal edilmemiş yetkilendirilmiş uygulamaları CSV formatında dışa aktarın.",
      exportAction: "Verileri İndir",
      exportPasswordVerifyDesc:
        "İndirmeden önce mevcut giriş parolanızı doğrulayın. CSV, profil verilerini ve iptal edilmemiş yetkilendirilmiş uygulamaları içerecektir.",
      exportSuccess: "Kullanıcı verileri indirmesi başlatıldı",
      exportFailed: "Kullanıcı verilerini dışa aktarma başarısız",
      minimizeTitle: "Veri Minimizasyonu",
      minimizeDesc:
        "Sistem yalnızca kayıt ülkesi, e-posta, izinler ve temel giriş güvenlik verilerini saklar.",
      scopeTitle: "Mevcut Erişim Kapsamı",
      scopeDesc:
        "Hesabınıza erişen uygulamaları Yetkilendirilmiş Uygulamalar'da görüntüleyebilir ve herhangi bir zamanda iptal edebilirsiniz.",
      statusTitle: "Hesap Durumu",
      statusDesc:
        "Hesap dondurulmuşsa, bir yönetici tarafından çözülene kadar giriş engellenir.",
      deleteTitle: "Hesabı Sil",
      deleteDesc:
        "7 gün içinde tekrar giriş yaparsanız, silme isteği otomatik olarak iptal edilir. Aksi takdirde hesap ve izin verilerini kaldıracağız.",
      deleteWarningPrimary:
        "Hesabı silmek geri alınamaz bir eylemdir. Lütfen önce bu hesapla ilişkili tüm verileri yedekleyin.",
      deleteWarningSecondary:
        "Talep gönderildikten sonra, 7 gün içinde tekrar giriş yapmak silme işlemini iptal edecektir; 7 gün içinde giriş yapmazsanız, sistem otomatik olarak hesabı ve izin verilerini siler.",
      deleteAction: "Okudum ve Sonuçları Kabul Ediyorum",
      passwordVerifyTitle: "Mevcut Parolayı Doğrula",
      passwordVerifyDesc:
        "Lütfen mevcut giriş parolanızı girin ve e-posta doğrulamasını tamamlayın. Telefon numarası bağlanmışsa, telefon doğrulaması da gereklidir.",
      emailVerifyCode: "E-posta Doğrulama Kodu",
      emailVerifyCodePlaceholder: "E-postanıza gönderilen 6 haneli kodu girin",
      sendDeleteEmailCode: "E-posta Kodu Gönder",
      sendDeleteEmailCodeSuccess: "E-posta doğrulama kodu gönderildi. Lütfen e-postanızı kontrol edin.",
      sendDeleteEmailCodeFailed: "E-posta doğrulama kodu gönderilemedi",
      phoneVerifyCode: "Telefon Doğrulama Kodu",
      phoneVerifyCodePlaceholder: "Telefonunuza gönderilen 6 haneli kodu girin",
      sendDeletePhoneCode: "Telefon Kodu Gönder",
      sendDeletePhoneCodeSuccess: "Telefon doğrulama kodu gönderildi. Lütfen telefonunuzu kontrol edin.",
      sendDeletePhoneCodeFailed: "Telefon doğrulama kodu gönderilemedi",
      confirmDeleteNow: "Silme Talep Etmeyi Onayla",
      deleteSuccess: "Silme isteği gönderildi. 7 gün içinde giriş yapmak silme işlemini iptal edecektir.",
      deleteFailed: "Silme isteği gönderilemedi",
      deletePendingAt: "Hesap silme isteği gönderildi. Planlanan silme zamanı: {{date}}",
    },
    bindings: {
      title: "Bağlantılar",
      appId: "Uygulama Adı",
      scopes: "Kapsamlar",
      createdAt: "Yetkilendirildiği Zaman",
      authorizedAt: "Yetkilendirildiği Zaman",
      status: "Durum",
      action: "Eylem",
      viewDetails: "Detayları Gör",
      detailTitle: "Yetkilendirme Detayları",
      siteName: "Yetkilendirilen Site",
      requestedPermissions: "Verilen İzinler",
      accessStatus: "Erişim Durumu",
      reason: "Neden",
      effectiveAt: "Yürürlük Tarihi",
      expiresAt: "Son Kullanma Tarihi",
      accessStatusNormal: "Aktif",
      accessStatusRestricted: "Kısıtlı",
      accessStatusBanned: "Yasaklı",
      scopeOpenIdTitle: "Kimliğinizi doğrulayın",
      scopeOpenIdDesc:
        "Mevcut giriş yapan hesabın gerçekten sizin olduğunuzu doğrulamak ve temel giriş oturumu oluşturmak için kullanılır.",
      scopeProfileTitle: "Kamu profilinize erişin",
      scopeProfileDesc:
        "Uygulama içinde görüntülemek için kullanılan takma ad, avatar ve diğer kamup rofil verilerini içerir.",
      scopeEmailTitle: "E-posta adresinize erişin",
      scopeEmailDesc:
        "Hesap e-postasını göstermek veya gerekli olduğunda bildirim göndermek ve hesabınızı bağlamak için kullanılır.",
      scopePhoneTitle: "Telefon numaranıza erişin",
      scopePhoneDesc:
        "Gerekli olduğunda hesap tanıma, bildirimler veya güvenlik doğrulaması için kullanılır.",
      scopeGatewayReadTitle: "Korunan iş API'lerine erişin",
      scopeGatewayReadDesc:
        "Yetkilendirdikten sonra uygulamanın sizin adınıza korunan API kaynaklarına erişmesine izin verir.",
      scopeCustomTitle: "İzin Talep Ediliyor: {{scope}}",
      scopeCustomDesc:
        "Bu uygulama ek bir iş izni talep ediyor. Devam etmeden önce dikkatlice gözden geçirin.",
      revoke: "İptal Et",
      batchRevoke: "Toplu İptal",
      batchRevokeConfirmTitle: "Toplu iptali onaylıyor musunuz?",
      batchRevokeConfirmDesc:
        "{{count}} yetkilendirme seçildi. Bu uygulamaların tekrar izin istemesi gerekecektir.",
    },
    help: {
      title: "Yardım Merkezi",
      loginIssueTitle: "Giriş Yapamıyorum",
      loginIssueDesc:
        "Giriş yapamıyorsanız, önce hesap için doğru yöntemi kullandığınızdan emin olun, örneğin parola, e-posta kodu, telefon kodu veya passkey'in hesap için mevcut yapılandırma ile eşleşip eşleşmediğini kontrol edin. Doğrulama kodu reddedilirse, kodun hala geçerli olup olmadığını ve e-postanın veya mesajın en sonuncusu olup olmadığını kontrol edin; hesap dondurulmuş, etkinleştirilmeyi bekleyen veya durumda sorun varsa, sorunu platform yöneticisi tarafından ele alınması gerekmektedir. Son zamanlarda bir hesap silme isteği gönderdiyseniz, tekrar giriş yaptığınızda sistem, silme onayı tamamlamanızı veya telefon numarası bağlamayı tamamlamanızı gerektirebilir.",
      protectTitle: "Hesabınızı Nasıl Korursunuz",
      protectDesc:
        "Olabildiği kadar kısa sürede iki faktörlü doğrulamayı etkinleştirin ve güvenilir cihazlarda passkey'ler bağlayın, böylece tek parola sızıntısının riskini azaltın. Kimseye e-posta kodlarını, SMS kodlarını veya MFA kodlarını paylaşmayın ve güvenmediğiniz sayfalarda kimlik bilgilerinizi tekrar girmemeyin. Aynı hesabı birden fazla cihazda kullanıyorsanız, son giriş kayıtlarını, bağlı passkey'leri ve yetkilendirilmiş uygulama listelerini düzenli olarak kontrol edin ve artık kullanmadığınız cihazları ve yetkilendirmeleri silin.",
      authIssueTitle: "Yetkilendirme Sorunları",
      authIssueDesc:
        "Bir uygulamanın yetkilendirme kapsamı anormal, uygulama adı tanınmıyor veya hesabınızın başka bir hizmet tarafından kötüye kullanıldığını düşünüyorsanız, Yetkilendirilmiş Uygulamalar sayfasına gidin ve uygulamanın yetkilendirme zamanını, verilen izinleri ve entegrasyon bilgilerini görüntüleyin, gerekirse hemen iptal edin. İptal edildikten sonra, uygulama yetkilendirilmiş kimliğinizle korunan kaynaklara erişemez; kullanmaya devam etmek istiyorsanız, uygulamayı yeniden giriş yapın ve yeni bir izin isteği onaylayın. Sadece tek bir uygulama değil, tüm hesabının anormal olduğunu düşünüyorsanız, aynı zamanda parolanızı değiştirin, iki faktörlü doğrulama ayarlarınızı doğrulayın ve son giriş ve passkey etkinliğini kontrol edin.",
      contactTitle: "Bize Ulaşın",
      contactDesc:
        "Manuel destek gerekiyorsa, aşağıdaki platform destek iletişim bilgilerini kullanabilirsiniz. Sorun bildirirken, sorunun oluştuğu zaman, hata ekran görüntüleri, kullandığınız giriş yöntemi ve ilgili cihaz veya tarayıcı bilgilerini de sağlayın, böylece sorunun daha hızlı incelenmesi sağlanır.",
      contactMainlandTitle: "Çin Ana Karada",
      contactOverseasTitle: "Uluslararası",
      contactPersonLabel: "Kişi:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "E-posta:",
      contactHoursLabel: "Servis Saatleri:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Pazartesi-Cuma 09:00 - 18:00",
      contactOverseasPersonValue: "Doldurulacak",
      contactOverseasPhoneValue: "Doldurulacak",
      contactOverseasEmailValue: "Doldurulacak",
      contactOverseasHoursValue: "Pazartesi-Cuma 09:00 - 18:00",
      contactRegionNotice:
        "Lütfen bulunduğunuz bölgeye göre ilgili destek kanalını tercih edin; hangi bölgeye ait olduğunu belirleyemiyorsanız, yönlendirme yardımı almak için önce Çin Ana Karası iletişim bilgilerini kullanın.",
      contactNotice:
        "Dondurulmuş hesaplar, yetkilendirme anormallikleri, kayıp passkey'ler veya silme kurtarma gibi sorunlar için, önce yukarıdaki e-posta veya telefon aracılığıyla yöneticilerle iletişime geçin; platformun resmi bir bilet sistemi, duyuru paneli veya operasyon grubu varsa, o resmi kanalı önce takip edin.",
    },
  },
} as const;

export default locale;