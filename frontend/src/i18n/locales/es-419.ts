const locale = {
  translation: {
    header: {
      language: "Idioma",
      languageModalTitle: "Seleccionar idioma",
      languageModalDesc: "Seleccione el idioma de la interfaz que desea usar.",
      agreement: "Acuerdo de usuario",
      privacy: "Política de privacidad",
      help: "Centro de ayuda",
      logout: "Cerrar sesión",
      accountCenter: "Centro de cuenta",
    },
    legal: {
      back: "Volver al inicio",
      updatedAt: "Última actualización: {{date}}",
      agreement: {
        title: "Acuerdo de usuario",
        updatedAt: "2026-03-16",
        intro:
          "Bienvenido a {{siteName}}. Antes de registrarse, iniciar sesión, integrar o usar los servicios de identidad unificada, lea cuidadosamente este acuerdo. Al continuar usando el servicio, acepta estar sujeto a este acuerdo.",
        sections: {
          accountTitle: "1. Cuenta e inicio de sesión",
          accountP1:
            "Debe proporcionar información de registro verdadera, legal y accesible, y mantener su cuenta, contraseña, códigos de verificación y otras credenciales debidamente protegidas. Usted es responsable de las pérdidas causadas por la mala gestión de credenciales de su parte.",
          accountP2:
            "Si se detecta actividad de inicio de sesión anormal, violación de políticas, estado congelado o riesgos de seguridad, la plataforma puede requerir verificación adicional, restringir el inicio de sesión o suspender el acceso por razones de seguridad.",
          acceptableUseTitle: "2. Uso aceptable",
          acceptableUseP1:
            "No debe usar este sistema para ninguna actividad ilegal, infracción de derechos, abuso de interfaces de autenticación, solicitudes masivas, credential stuffing o comportamiento que amenace la estabilidad de la plataforma o eluda los controles de seguridad.",
          acceptableUseP2:
            "Si viola este acuerdo o reglas relacionadas, la plataforma puede suspender o terminar parte o todo su acceso y se reserva el derecho de perseguir responsabilidad cuando sea necesario.",
          authorizationTitle: "3. Autorización y aplicaciones de terceros",
          authorizationP1:
            "Cuando usa una cuenta de {{siteName}} para iniciar sesión en una aplicación de terceros, el sistema le pedirá su consentimiento basado en los permisos mostrados en la página de autorización. Puede rechazar o revocar ese consentimiento en cualquier momento en el centro de cuentas.",
          authorizationP2:
            "Cualquier uso de sus datos por una aplicación de terceros después de la autorización se rige por los propios términos de servicio y política de privacidad de esa aplicación. La plataforma asumirá responsabilidad solo dentro del alcance requerido por la ley.",
          developerTitle: "4. Integración de desarrolladores",
          developerP1:
            "Los desarrolladores deben asegurar que la información de la aplicación, URI de redirección, alcances solicitados y propósitos comerciales sean verdaderos, completos y continuamente válidos, y no deben engañar a los usuarios.",
          developerP2:
            "La plataforma puede revisar, rechazar, eliminar, borrar o restringir aplicaciones conectadas para mantener la seguridad e integridad del ecosistema de identidad unificada.",
          liabilityTitle: "5. Cambios en el servicio y limitación de responsabilidad",
          liabilityP1:
            "Por razones de seguridad, cumplimiento, operaciones o mantenimiento, la plataforma puede ajustar, actualizar, suspender o terminar ciertas interfaces, flujos o funciones, e intentará proporcionar aviso cuando sea apropiado.",
          liabilityP2:
            "En la medida permitida por la ley, la plataforma no es responsable más allá de las obligaciones legales por interrupciones, datos anormales o pérdidas causadas por fuerza mayor, fallas de red, razones de terceros o uso inadecuado de su parte.",
        },
      },
      privacy: {
        title: "Política de privacidad",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}} valora su información personal y la seguridad de la cuenta. Esta política explica cómo recopilamos, usamos, almacenamos, compartimos y protegemos su información, así como los derechos disponibles para usted.",
        sections: {
          dataCollectionTitle: "1. Información que recopilamos",
          dataCollectionP1:
            "Cuando se registra, inicia sesión o usa servicios de cuenta, podemos recopilar su país de registro, dirección de correo electrónico, número de teléfono, hash de contraseña, sesiones de inicio de sesión, IP del dispositivo, registros de autorización y registros de seguridad necesarios.",
          dataCollectionP2:
            "Cuando sube un avatar, cambia su perfil, vincula un número de teléfono, habilita MFA o autoriza una aplicación de terceros, procesamos la información que envía según sea necesario para proporcionar esa función.",
          dataUsageTitle: "2. Cómo usamos la información",
          dataUsageP1:
            "Usamos información relevante para proporcionar registro de cuenta, autenticación de inicio de sesión, entrega de códigos de verificación, control de riesgos, confirmación de autorización, revisión de aplicaciones de desarrolladores, notificaciones de seguridad de cuenta y mantenimiento de la confiabilidad del servicio.",
          dataUsageP2:
            "También analizamos registros y estadísticas sobre una base mínima necesaria para detectar actividad anormal, mejorar la experiencia del producto y fortalecer la seguridad.",
          dataSharingTitle: "3. Compartir y divulgación",
          dataSharingP1:
            "Solo proporcionamos información de identidad o datos relacionados con permisos a aplicaciones de terceros cuando autoriza explícitamente los alcances mostrados en la página de autorización.",
          dataSharingP2:
            "Excepto donde lo requiera la ley, solicitudes regulatorias, protección del interés público o necesidades de seguridad del sistema, no vendemos ni compartimos ilegalmente su información personal con terceros no relacionados.",
          userRightsTitle: "4. Sus derechos",
          userRightsP1:
            "Puede revisar y actualizar su perfil, vinculaciones, registros de autorización y configuraciones de seguridad en el centro de cuentas, y puede revocar consentimientos de aplicaciones o enviar una solicitud de eliminación de cuenta.",
          userRightsP2:
            "Si cree que su información es inexacta, procesada incorrectamente o usada más allá de la necesidad, puede contactar al operador de la plataforma o ejercer sus derechos bajo la ley aplicable.",
          securityTitle: "5. Protección y retención",
          securityP1:
            "Usamos controles de acceso, hash de contraseñas, vencimiento de códigos de verificación, registros de auditoría y medidas de minimización de datos para proteger su información personal y datos de autenticación.",
          securityP2:
            "Sujeto a requisitos legales y comerciales, retenemos su información solo el tiempo necesario para cumplir los propósitos del servicio; después de la eliminación de la cuenta o el vencimiento de los períodos de retención, eliminaremos o anonimizaremos los datos según la política.",
        },
      },
    },
    auth: {
      noAccount: "¿No tiene cuenta?",
      registerNow: "Regístrese ahora",
      registerPageTitle: "Crear cuenta",
      registerPageSubtitle:
        "Complete el registro con su país, correo electrónico y código de verificación de correo electrónico.",
      registerDisabled: "El registro está actualmente deshabilitado",
      registerSuccess:
        "Registro exitoso. Inicie sesión con su contraseña.",
      phoneBindingRequiredAfterRegister:
        "El registro fue exitoso. Primero vincule su número de teléfono para activar la cuenta.",
      registerFailed: "El registro falló",
      country: "País",
      countryRequired: "Seleccione un país",
      registerCode: "Código de correo",
      registerCodeRequired: "Ingrese el código de verificación de correo",
      registerCodePlaceholder: "Ingrese el código de 6 dígitos",
      sendRegisterCode: "Enviar código",
      sendRegisterCodeSuccess:
        "El código de verificación ha sido enviado. Por favor revise su bandeja de entrada.",
      sendRegisterCodeFailed: "No se pudo enviar el código de verificación",
      backToLoginWithAccount: "¿Ya tiene cuenta? Inicie sesión",
      forgotPassword: "¿Olvidó su contraseña?",
      forgotPasswordPageTitle: "Restablecer contraseña",
      forgotPasswordPageSubtitle:
        "Restablezca su contraseña de inicio de sesión con su correo electrónico registrado y código de verificación.",
      forgotPasswordPrompt: "¿Olvidó su contraseña?",
      forgotPasswordAction: "Recupérala",
      forgotPasswordDesc:
        "Después de verificar su correo electrónico con un código, puede establecer una nueva contraseña de inicio de sesión directamente.",
      forgotPasswordHint:
        "Ingrese su correo electrónico registrado, el código de verificación y una nueva contraseña. Puede iniciar sesión con la nueva contraseña de inmediato después del envío.",
      goToOtpLogin: "Usar inicio de sesión con código de correo",
      resetCode: "Código de recuperación",
      sendResetCode: "Enviar código de recuperación",
      sendResetCodeSuccess:
        "El código de recuperación ha sido enviado. Por favor revise su bandeja de entrada.",
      sendResetCodeFailed: "No se pudo enviar el código de recuperación",
      resetPassword: "Restablecer contraseña",
      resetPasswordSuccess:
        "Contraseña restablecida exitosamente. Inicie sesión con su nueva contraseña.",
      resetPasswordFailed: "No se pudo restablecer la contraseña",
      newPassword: "Nueva contraseña",
      confirmNewPassword: "Confirmar nueva contraseña",
      newPasswordPlaceholder: "Ingrese una contraseña de al menos 8 caracteres",
      confirmPassword: "Confirmar contraseña",
      confirmPasswordPlaceholder: "Ingrese la contraseña nuevamente",
      backToLogin: "Volver al inicio de sesión",
      emailRequired: "Ingrese su correo electrónico",
      passwordRequired: "Ingrese su contraseña",
      otpCodeRequired: "Ingrese el código de verificación de correo",
      phoneRequired: "Ingrese su número de teléfono",
      phoneOtpCodeRequired: "Ingrese el código de verificación SMS",
      emailInvalid: "Ingrese una dirección de correo válida",
      resetCodeRequired: "Ingrese el código de recuperación",
      resetCodePlaceholder: "Ingrese el código de recuperación de 6 dígitos",
      newPasswordRequired: "Ingrese una nueva contraseña",
      confirmNewPasswordRequired: "Confirme la nueva contraseña nuevamente",
      newPasswordMinLength: "La nueva contraseña debe tener al menos 8 caracteres",
      passwordMinLength: "La contraseña debe tener al menos 8 caracteres",
      newPasswordMismatch: "Las dos nuevas contraseñas no coinciden",
      passwordMismatch: "Las dos contraseñas no coinciden",
      registrationClosed: "El registro está actualmente cerrado",
      login: "Iniciar sesión",
      passkeyLogin: "Clave de acceso",
      passkeyLoginDesc:
        "Use una clave de acceso ya vinculada a este sitio en su dispositivo o cuenta del sistema.",
      passkeyLoginButton: "Usar clave de acceso",
      passkeyLoginHint:
        "Debe vincular una clave de acceso en el centro de cuentas antes de usarla aquí.",
      passkeyLoginSuccess: "Clave de acceso agregada exitosamente",
      passkeyNotAvailable:
        "No hay clave de acceso disponible para este sitio en este dispositivo. Use otro método de inicio de sesión.",
      passwordLogin: "Contraseña",
      otpLogin: "Código de correo",
      phoneOtpLogin: "Código de teléfono",
      email: "Correo electrónico",
      phone: "Número de teléfono",
      password: "Contraseña",
      otpCode: "Código de correo",
      phoneOtpCode: "Código SMS",
      mfaCode: "Código 2FA",
      mfaPlaceholder: "Deje en blanco si la autenticación de dos factores no está habilitada",
      sendOtpCode: "Enviar código de correo",
      sendOtpCodeSuccess:
        "El código de correo ha sido enviado. Por favor revise su bandeja de entrada.",
      sendOtpCodeFailed: "No se pudo enviar el código de verificación",
      sendOtpCodeEmailRequired: "Ingrese su correo electrónico antes de solicitar un código",
      sendPhoneOtpCode: "Enviar código SMS",
      sendPhoneOtpCodeSuccess:
        "El código SMS ha sido enviado. Por favor revise su teléfono.",
      sendPhoneOtpCodeFailed: "No se pudo enviar el código SMS",
      sendPhoneBindingCode: "Enviar código de vinculación",
      sendPhoneBindingCodeSuccess:
        "El código de vinculación telefónica ha sido enviado. Por favor revise su teléfono.",
      sendPhoneBindingCodeFailed: "No se pudo enviar el código de vinculación telefónica",
      securityCaptcha: "Verificación de seguridad",
      securityCaptchaPlaceholder:
        "Ingrese el valor de verificación de seguridad e intente nuevamente",
      securityCaptchaHelp:
        "Cuando el dispositivo o IP actual envía solicitudes con demasiada frecuencia, complete esta verificación de seguridad antes de solicitar otro código.",
      securityCaptchaRequiredTip:
        "El volumen de solicitudes es alto. Complete la verificación de seguridad antes de solicitar otro código.",
      sendOtpCodePhoneRequired:
        "Ingrese su número de teléfono antes de solicitar un código",
      phoneBindingPageTitle: "Vincular número de teléfono",
      phoneBindingRegisterDesc:
        "Esta cuenta activó la regla de riesgo posterior al registro. Vincule un número de teléfono antes de continuar.",
      phoneBindingLoginDesc:
        "Esta cuenta activó la regla de riesgo de inicio de sesión. Vincule un número de teléfono antes de continuar.",
      completePhoneBinding: "Vincular y continuar",
      phoneBindingSuccess:
        "Número de teléfono vinculado exitosamente. La cuenta está activa nuevamente.",
      mfaVerifyTitle: "Verificación de dos factores",
      mfaVerifyEmailHint:
        "Se envió un código de verificación a {{target}}. Ingréselo para continuar iniciando sesión.",
      mfaVerifyPhoneHint:
        "Se envió un código de verificación a {{target}}. Ingréselo para continuar iniciando sesión.",
      loginStepUpTitle: "Verificación adicional de inicio de sesión",
      loginStepUpEmailDesc:
        "Este inicio de sesión requiere verificación adicional por correo. Se enviará un código a {{email}}.",
      loginStepUpSMSDesc:
        "Este inicio de sesión requiere verificación adicional por teléfono. Se enviará un código a {{phone}}.",
      loginStepUpDualDesc:
        "Este inicio de sesión requiere verificación tanto por correo como por teléfono. Correo: {{email}}, teléfono: {{phone}}.",
      loginStepUpExpired:
        "La sesión de verificación adicional de inicio de sesión ha expirado. Por favor inicie sesión nuevamente.",
      forcedMfaEnrollmentTitle: "Se debe habilitar la autenticación de dos factores",
      forcedMfaEnrollmentDesc:
        "Un administrador requiere que esta cuenta habilite la autenticación de dos factores antes de que pueda completarse este inicio de sesión.",
      forcedMfaEnrollmentExpired:
        "La sesión de inscripción forzada de MFA ha expirado. Por favor inicie sesión nuevamente.",
      completeForcedMfaEnrollment: "Habilitar y continuar",
      cancelForcedMfaEnrollment: "Cancelar y volver al inicio de sesión",
      verifyAndLogin: "Verificar e iniciar sesión",
      deletionConfirmTitle: "Solicitud de eliminación de cuenta enviada",
      deletionConfirmScheduledAt: "Fecha de eliminación programada: {{date}}",
      deletionConfirmDesc:
        "Si inicia sesión nuevamente, la eliminación será cancelada.",
      deletionConfirmContinue: "Continuar y cancelar eliminación",
      deletionConfirmExpired: "La confirmación ha expirado, por favor inicie sesión nuevamente",
      deletionConfirmFailed: "La confirmación falló, por favor inicie sesión nuevamente",
      logoutProgressTitle: "Cerrando sesión",
      logoutProgressDesc:
        "La sesión de identidad ha sido limpiada y las aplicaciones conectadas están cerrando sesión.",
      loginFailed: "El inicio de sesión falló",
      oidcCallbackFailed: "OIDC Callback falló",
      appRejected: "Aplicación rechazada",
      appRejectedWithReason: "Aplicación rechazada: {{reason}}",
      appNotFound: "Aplicación no encontrada",
      accessDenied: "Acceso denegado",
      tokenExchangeFailed: "El intercambio de token falló",
      authorize: {
        title: "Use {{siteName}} para iniciar sesión en {{appName}}",
        desc: "Esta aplicación está solicitando la siguiente información y permisos. Después de confirmar, regresará a la aplicación comercial para completar el inicio de sesión.",
        chooseAccountTitle: "Ya ha iniciado sesión en {{siteName}}",
        chooseAccountDesc:
          "Elija si desea continuar con la cuenta actual o iniciar sesión con una cuenta diferente primero.",
        currentAccountFallback: "Cuenta actual",
        useCurrentAccount: "Continuar con esta cuenta",
        useAnotherAccount: "Iniciar sesión con otra cuenta",
        permissionTitle: "Permisos solicitados",
        permissionCount: "{{count}} elementos",
        agreement:
          "He leído y acepto otorgar los permisos enumerados anteriormente",
        confirm: "Confirmar y continuar",
        cancel: "Cancelar y volver al inicio de sesión",
        scopes: {
          openidTitle: "Confirme su identidad",
          openidDesc:
            "Se usa para verificar que la cuenta actualmente iniciada le pertenece y establecer la sesión de inicio de sesión básica.",
          profileTitle: "Acceder a su perfil público",
          profileDesc:
            "Incluye su nombre para mostrar, avatar y datos similares del perfil público para presentación dentro de la aplicación.",
          emailTitle: "Acceder a su información de correo",
          emailDesc:
            "Se usa para mostrar el correo de su cuenta o admitir notificaciones y vinculación de cuenta cuando sea necesario.",
          phoneTitle: "Acceder a su número de teléfono",
          phoneDesc:
            "Se usa para reconocimiento de cuenta, notificaciones o verificación de seguridad cuando sea necesario.",
          gatewayReadTitle: "Acceder a API comerciales protegidas",
          gatewayReadDesc:
            "Permite que la aplicación acceda a recursos protegidos como su identidad autorizada.",
          customTitle: "Solicitando permiso: {{scope}}",
          customDesc:
            "Esta aplicación está solicitando un permiso comercial adicional. Revíselo cuidadosamente antes de continuar.",
        },
      },
      sessionConflict: {
        title: "Se detectaron diferentes cuentas en este navegador",
        desc: "La cuenta recordada por esta ventana no coincide con la cuenta actualmente activa del navegador. Solo una cuenta principal puede permanecer activa en el mismo navegador a la vez. Elija con qué cuenta desea continuar.",
        browserAccount: "Cuenta activa del navegador",
        thisWindowAccount: "Cuenta anterior de esta ventana",
        useBrowserAccount: "Usar la cuenta activa del navegador",
        useThisWindowAccount: "Cambiar a la cuenta de esta ventana",
        relogin: "Cerrar sesión e iniciar sesión nuevamente",
      },
    },
    nav: {
      security: "Inicio de sesión y seguridad",
      profile: "Perfil",
      privacy: "Centro de privacidad",
      bindings: "Aplicaciones autorizadas",
      help: "Centro de ayuda",
    },
    common: {
      loadingFailed: "No se pudo cargar",
      revokeFailed: "No se pudo revocar el consentimiento",
      revokeSuccess: "Consentimiento revocado",
      confirm: "Confirmar",
      sendCode: "Enviar código",
      sendCodeSuccess: "Código de verificación enviado exitosamente",
      sendingCode: "Enviando",
      save: "Guardar",
      saving: "Guardando",
      edit: "Editar",
      cancel: "Cancelar",
      uploadAvatar: "Subir avatar",
      avatarUpdated: "Avatar actualizado",
      avatarUploadFailed: "No se pudo subir el avatar",
      profileUpdated: "Perfil actualizado",
      profileUpdateFailed: "No se pudo actualizar el perfil",
      imageReadFailed: "No se pudo leer la imagen",
      imageProcessUnsupported:
        "El procesamiento de imágenes no es compatible en este navegador",
      avatarConvertFailed: "No se pudo convertir el avatar",
      unset: "No establecido",
      unsetShort: "No establecido",
      notFilled: "No proporcionado",
      noRecord: "Sin registros",
      normal: "Activo",
      accountCenter: "Centro de cuenta",
      noAuthorizedApps: "Sin aplicaciones autorizadas",
    },
    errors: {
      emailRequiredByServer: "Por favor ingrese su correo electrónico",
      passwordRequiredByServer: "Por favor ingrese su contraseña",
      invalidCredentials: "Cuenta o credenciales inválidas",
      invalidOtpCode: "El código de verificación es inválido o ha expirado",
      accountFrozen: "Esta cuenta ha sido congelada",
      accountFrozenWithReason:
        "Esta cuenta ha sido congelada. Razón: {{reason}}",
      userNotFound: "Usuario no encontrado",
      smsNotConfigured: "El envío de SMS no está configurado",
      smtpNotConfigured: "El envío de correo no está configurado",
      userStatusInvalid:
        "El estado actual de la cuenta no permite esta acción",
      invalidCurrentPhoneVerificationCode:
        "El código de verificación telefónica actual es inválido o ha expirado",
      invalidNewPhoneVerificationCode:
        "El nuevo código de verificación telefónica es inválido o ha expirado",
      currentPhoneVerificationCodeRequired:
        "Ingrese el código de verificación telefónica actual",
      currentPhoneNotBound:
        "No hay número de teléfono actualmente vinculado a esta cuenta",
      phoneDoesNotMatchCurrentBoundPhone:
        "El número de teléfono no coincide con el actualmente vinculado",
      phoneAlreadyBound: "Este número de teléfono ya está vinculado",
      newPhoneMustBeDifferent:
        "El nuevo número de teléfono debe ser diferente del actual",
      phoneAndVerificationCodeRequired:
        "Ingrese el número de teléfono y el nuevo código de verificación telefónica",
      invalidMfaCode: "El código de verificación de dos factores es inválido o ha expirado",
      unsupportedMfaMethod: "Método de autenticación de dos factores no compatible",
      mfaNotEnabled:
        "La autenticación de dos factores no está habilitada para esta cuenta",
      emailNotBound: "No hay correo electrónico vinculado a esta cuenta",
      phoneNotBound: "No hay número de teléfono vinculado a esta cuenta",
      emailVerificationCodeRequired: "Ingrese el código de verificación de correo",
      invalidEmailVerificationCode:
        "El código de verificación de correo es inválido o ha expirado",
      phoneVerificationCodeRequired: "Ingrese el código de verificación telefónica",
      invalidPhoneVerificationCode:
        "El código de verificación telefónica es inválido o ha expirado",
      newPasswordMustBeDifferentFromCurrentPassword:
        "La nueva contraseña debe ser diferente de la contraseña actual",
      phoneBindingChallengeExpired:
        "La sesión de vinculación telefónica ha expirado. Por favor inicie sesión o regístrese nuevamente.",
      manualMfaCodeNotSendable:
        "Esta cuenta usa un código MFA manual y no puede enviar un código",
      emailAndPasswordRequired:
        "Ingrese su correo electrónico y contraseña antes de solicitar un código de dos factores",
      mfaChallengeExpiredOrInvalid:
        "La sesión de verificación de dos factores ha expirado. Por favor inicie sesión nuevamente.",
      challengeRequired:
        "Complete el desafío de seguridad antes de solicitar un código.",
      captchaRequired:
        "El volumen de solicitudes es alto. Complete la verificación de seguridad primero.",
      rateLimitExceeded: "Demasiadas solicitudes. Por favor intente nuevamente más tarde.",
      circuitOpen:
        "El canal de entrega está temporalmente protegido. Por favor intente nuevamente más tarde.",
      cooldownActive:
        "Este objetivo ha solicitado códigos con demasiada frecuencia. Por favor intente nuevamente más tarde.",
      passkeyChallengeExpired: "La sesión de clave de acceso ha expirado. Por favor intente nuevamente.",
      passkeyVerificationFailed:
        "La verificación de clave de acceso falló. Intente nuevamente o use otro método de inicio de sesión.",
      passkeyAlreadyExists: "Esta clave de acceso ya está vinculada.",
      passkeyNotFound: "Clave de acceso no encontrada.",
      passkeyBrowserUnsupported:
        "Este navegador o dispositivo no es compatible con claves de acceso.",
      passkeyUserHandleInvalid:
        "No se pudo identificar la cuenta para esta clave de acceso.",
      invalidLoginStepUpVerificationCode:
        "El código de verificación adicional es inválido o ha expirado.",
      loginStepUpChallengeExpiredOrInvalid:
        "La sesión de verificación adicional ha expirado. Por favor inicie sesión nuevamente.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "La sesión de inscripción forzada de MFA ha expirado. Por favor inicie sesión nuevamente.",
      noAvailableMfaMethodForCurrentAccount:
        "No hay método MFA disponible para esta cuenta.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "No hay objetivo de verificación adicional disponible para esta cuenta.",
    },
    security: {
      loginMethods: "Métodos de inicio de sesión",
      phone: "Vincular número de teléfono",
      phoneDesc:
        "Se usa para métodos de inicio de sesión adicionales, verificación SMS y notificaciones de seguridad de cuenta",
      bindPhone: "Vincular",
      bindPhoneTitle: "Vincular número de teléfono",
      bindPhoneHint:
        "Verifique el número de teléfono primero antes de vincular. El código de verificación se enviará a este número de teléfono.",
      rebindPhoneHint:
        "Para reemplazar el número de teléfono vinculado, primero verifique el número de teléfono actual y luego verifique el nuevo.",
      currentPhone: "Número de teléfono actualmente vinculado",
      currentPhoneCode: "Código de verificación telefónica actual",
      currentPhoneCodePlaceholder:
        "Ingrese el código de 6 dígitos enviado al número de teléfono actual",
      sendCurrentPhoneCode: "Enviar código de teléfono actual",
      newPhone: "Número de teléfono",
      newPhoneCode: "Nuevo código de verificación telefónica",
      newPhonePlaceholder: "Ingrese un número de teléfono, por ejemplo 13800138000",
      smsCode: "Código de verificación SMS",
      smsCodePlaceholder: "Ingrese el código SMS de 6 dígitos",
      safeEmail: "Correo electrónico seguro",
      safeEmailDesc: "Credencial principal usada para iniciar sesión",
      editEmailTitle: "Cambiar correo electrónico seguro",
      newEmail: "Nuevo correo electrónico",
      newEmailPlaceholder: "Ingrese la nueva dirección de correo electrónico",
      emailCode: "Código de correo",
      emailCodePlaceholder: "Ingrese el código de 6 dígitos",
      changeEmailHint:
        "El nuevo correo electrónico debe ser verificado antes de guardar el cambio.",
      changePassword: "Cambiar contraseña",
      changePasswordDesc:
        "Actualice su contraseña de inicio de sesión regularmente para mejorar la seguridad de la cuenta",
      editPasswordTitle: "Cambiar contraseña de inicio de sesión",
      currentPassword: "Contraseña actual",
      currentPasswordPlaceholder: "Ingrese su contraseña actual",
      currentPasswordIncorrect: "La contraseña actual es incorrecta",
      newPassword: "Nueva contraseña",
      newPasswordPlaceholder: "Ingrese una nueva contraseña de al menos 8 caracteres",
      confirmPassword: "Confirmar nueva contraseña",
      confirmPasswordPlaceholder: "Ingrese la nueva contraseña nuevamente",
      changePasswordHint:
        "Use la nueva contraseña la próxima vez que inicie sesión, y evite reutilizar la anterior.",
      passwordMinLength: "La contraseña debe tener al menos 8 caracteres",
      passwordMismatch: "Las dos nuevas contraseñas no coinciden",
      passwordUpdated: "Contraseña actualizada",
      passwordUpdateFailed: "No se pudo actualizar la contraseña",
      mfa: "Autenticación de dos factores",
      mfaDesc: "Cuando está habilitada, se requiere verificación adicional durante el inicio de sesión",
      mfaTitle: "Configurar autenticación de dos factores",
      mfaHint: "Elija el segundo método de verificación usado durante el inicio de sesión.",
      mfaTitleEnable: "Habilitar autenticación de dos factores",
      mfaTitleDisable: "Deshabilitar autenticación de dos factores",
      mfaHintEnable:
        "Elija el segundo método de verificación usado durante el inicio de sesión.",
      mfaHintDisable:
        "Después de deshabilitar, ya no se requerirá verificación adicional durante el inicio de sesión.",
      mfaMethod: "Método de verificación",
      mfaMethodEmail: "Código de correo",
      mfaMethodSMS: "Código de teléfono",
      passkeys: "Claves de acceso",
      passkeysDesc:
        "Después de vincular, puede iniciar sesión directamente desde el selector de claves de acceso del sistema.",
      addPasskey: "Agregar clave de acceso",
      deletePasskey: "Eliminar clave de acceso",
      passkeyName: "Nombre del dispositivo",
      passkeyNamePlaceholder: "Ingrese un nombre reconocible",
      passkeyLastUsed: "Último uso",
      passkeyLastUsedIP: "Última IP usada",
      passkeyCreatedAt: "Creado",
      passkeyEmpty: "Sin claves de acceso vinculadas",
      passkeyManageVerify:
        "Para proteger su cuenta, verifique sus credenciales actuales antes de agregar o eliminar una clave de acceso.",
      currentMfaCode: "Código MFA actual",
      currentMfaCodePlaceholder: "Ingrese el código del método MFA actual",
      currentMfaCodeHintEmail:
        "Complete la verificación con el código de correo actualmente vinculado antes de guardar.",
      currentMfaCodeHintSMS:
        "Complete la verificación con el código telefónico actualmente vinculado antes de guardar.",
      currentMfaCodeHintManual:
        "Ingrese el código MFA manual actualmente configurado antes de guardar.",
      accountSecurity: "Seguridad de la cuenta",
      recentLogin: "Inicio de sesión reciente",
      recentLoginDesc: "Última hora de inicio de sesión exitosa e IP del dispositivo",
    },
    profile: {
      title: "Perfil",
      avatar: "Avatar",
      avatarDesc:
        "La imagen se recortará automáticamente en el centro y se convertirá a webp",
      nickname: "Apodo",
      nicknameDesc: "Nombre para mostrar actual",
      gender: "Género",
      genderDesc: "Información de género del perfil para esta cuenta",
      languagePreference: "Preferencia de idioma",
      languagePreferenceDesc:
        "Después de iniciar sesión, este idioma se usará primero para el contenido de la página",
      languagePreferenceSaved: "Preferencia de idioma guardada",
      languagePreferenceSaveFailed: "No se pudo guardar la preferencia de idioma",
      genderMale: "Masculino",
      genderFemale: "Femenino",
      genderOther: "Otro",
      userId: "ID de usuario",
      userIdDesc: "Identificador único de la cuenta actual en el sistema",
      nicknamePlaceholder: "Ingrese apodo",
      editNicknameTitle: "Editar apodo",
      editGenderTitle: "Editar género",
      email: "Dirección de correo electrónico",
      emailDesc: "Se usa para iniciar sesión, verificación y notificaciones de seguridad",
      createdAt: "Registrado",
      createdAtDesc: "La hora en que se creó esta cuenta",
      country: "País de registro",
      countryDesc: "País o región registrados al momento del registro",
    },
    privacy: {
      title: "Centro de privacidad",
      exportTitle: "Descargar datos de usuario",
      exportDesc:
        "Exporte datos de perfil y aplicaciones autorizadas no revocadas en formato CSV.",
      exportAction: "Descargar datos",
      exportPasswordVerifyDesc:
        "Verifique su contraseña de inicio de sesión actual antes de descargar. El CSV incluirá datos de perfil y aplicaciones autorizadas no revocadas.",
      exportSuccess: "Descarga de datos de usuario iniciada",
      exportFailed: "No se pudieron exportar los datos de usuario",
      minimizeTitle: "Minimización de datos",
      minimizeDesc:
        "El sistema solo conserva el país de registro, correo electrónico, consentimientos y datos esenciales de seguridad de inicio de sesión.",
      scopeTitle: "Alcance de acceso actual",
      scopeDesc:
        "Puede revisar las aplicaciones que han accedido a su cuenta en Aplicaciones autorizadas y revocarlas en cualquier momento.",
      statusTitle: "Estado de la cuenta",
      statusDesc:
        "Si la cuenta está congelada, el inicio de sesión será bloqueado hasta que un administrador lo resuelva.",
      deleteTitle: "Eliminar cuenta",
      deleteDesc:
        "Si inicia sesión nuevamente dentro de 7 días, la solicitud de eliminación se cancelará automáticamente. De lo contrario, la cuenta y los datos de consentimiento serán eliminados.",
      deleteWarningPrimary:
        "Eliminar la cuenta es irreversible. Primero haga una copia de seguridad de todos los datos relacionados con esta cuenta.",
      deleteWarningSecondary:
        "Después de enviar la solicitud, iniciar sesión nuevamente dentro de 7 días cancelará la eliminación. Si no inicia sesión dentro de 7 días, el sistema eliminará automáticamente la cuenta y los datos de consentimiento.",
      deleteAction: "He leído y acepto las consecuencias",
      passwordVerifyTitle: "Verificar contraseña actual",
      passwordVerifyDesc:
        "Ingrese su contraseña de inicio de sesión actual y complete la verificación por correo. Si hay un número de teléfono vinculado, también se requiere verificación telefónica.",
      emailVerifyCode: "Código de verificación de correo",
      emailVerifyCodePlaceholder: "Ingrese el código de 6 dígitos enviado a su correo",
      sendDeleteEmailCode: "Enviar código de correo",
      sendDeleteEmailCodeSuccess:
        "El código de verificación de correo ha sido enviado. Por favor revise su bandeja de entrada.",
      sendDeleteEmailCodeFailed: "No se pudo enviar el código de verificación de correo",
      phoneVerifyCode: "Código de verificación telefónica",
      phoneVerifyCodePlaceholder: "Ingrese el código de 6 dígitos enviado a su teléfono",
      sendDeletePhoneCode: "Enviar código telefónico",
      sendDeletePhoneCodeSuccess:
        "El código de verificación telefónica ha sido enviado. Por favor revise su teléfono.",
      sendDeletePhoneCodeFailed: "No se pudo enviar el código de verificación telefónica",
      confirmDeleteNow: "Enviar solicitud de eliminación",
      deleteSuccess:
        "Solicitud de eliminación enviada. Iniciar sesión dentro de 7 días la cancelará.",
      deleteFailed: "No se pudo enviar la solicitud de eliminación",
      deletePendingAt:
        "Solicitud de eliminación enviada. Fecha de eliminación programada: {{date}}",
    },
    bindings: {
      title: "Aplicaciones autorizadas",
      appId: "Nombre de la aplicación",
      scopes: "Alcances",
      createdAt: "Autorizado",
      authorizedAt: "Autorizado",
      action: "Acción",
      viewDetails: "Detalles",
      detailTitle: "Detalles de autorización",
      siteName: "Sitio autorizado",
      requestedPermissions: "Permisos otorgados",
      scopeOpenIdTitle: "Confirme su identidad",
      scopeOpenIdDesc:
        "Se usa para confirmar que la cuenta iniciada realmente es usted y establecer la sesión de inicio de sesión básica.",
      scopeProfileTitle: "Acceder a su perfil público",
      scopeProfileDesc:
        "Incluye apodo, avatar y otros datos de perfil público para mostrar en la aplicación.",
      scopeEmailTitle: "Acceder a su dirección de correo",
      scopeEmailDesc:
        "Se usa para mostrar el correo de su cuenta o enviar notificaciones y vincular su cuenta cuando sea necesario.",
      scopePhoneTitle: "Acceder a su número de teléfono",
      scopePhoneDesc:
        "Se usa para reconocimiento de cuenta, notificaciones o verificación de seguridad cuando sea necesario.",
      scopeGatewayReadTitle: "Acceder a API comerciales protegidas",
      scopeGatewayReadDesc:
        "Permite que la aplicación acceda a recursos de API protegidos en su nombre después de la autorización.",
      scopeCustomTitle: "Permiso solicitado: {{scope}}",
      scopeCustomDesc:
        "Esta aplicación está solicitando un permiso comercial adicional. Revíselo cuidadosamente antes de continuar.",
      revoke: "Revocar",
      batchRevoke: "Revocación por lotes",
      batchRevokeConfirmTitle: "¿Confirmar revocación por lotes?",
      batchRevokeConfirmDesc:
        "Se han seleccionado {{count}} autorizaciones. Estas aplicaciones deberán solicitar consentimiento nuevamente.",
    },
    help: {
      title: "Centro de ayuda",
      loginIssueTitle: "No puede iniciar sesión",
      loginIssueDesc:
        "Si no puede iniciar sesión, primero confirme que está usando el método correcto para la cuenta, como contraseña, código de correo, código telefónico o clave de acceso. Si se rechaza un código de verificación, asegúrese de que sea el más reciente y aún dentro de su período de validez. Si la cuenta se muestra como congelada, pendiente de activación o de otra manera restringida, el problema debe ser manejado por un administrador de la plataforma. Si recientemente envió una solicitud de eliminación de cuenta, el sistema también puede requerir confirmación de eliminación o vinculación telefónica antes de que se restaure el acceso.",
      protectTitle: "Proteja su cuenta",
      protectDesc:
        "Habilite la autenticación de dos factores lo antes posible y vincule claves de acceso en dispositivos confiables para reducir el riesgo de compromiso solo por contraseña. Nunca comparta códigos de correo, códigos SMS o códigos MFA con terceros, ni ingrese credenciales nuevamente en páginas en las que no confíe. Si usa la misma cuenta en múltiples dispositivos, revise regularmente los inicios de sesión recientes, las claves de acceso vinculadas y las aplicaciones autorizadas, y elimine dispositivos o autorizaciones que ya no use.",
      authIssueTitle: "Problemas de autorización",
      authIssueDesc:
        "Si una aplicación parece desconocida, solicita alcances inusuales, o sospecha que está abusando de su cuenta, abra Aplicaciones autorizadas para revisar la hora de autorización, los alcances otorgados y los detalles de integración, y revóquela inmediatamente si es necesario. Después de la revocación, la aplicación ya no podrá acceder a recursos protegidos con su cuenta hasta que inicie sesión nuevamente y apruebe una nueva solicitud de consentimiento. Si el problema puede afectar toda la cuenta en lugar de una sola aplicación, también debe cambiar su contraseña, verificar su configuración de MFA y revisar los inicios de sesión recientes y la actividad de claves de acceso.",
      contactTitle: "Contáctenos",
      contactDesc:
        "Si necesita asistencia manual, puede contactar al soporte de la plataforma a continuación. Al reportar un problema, incluya el correo electrónico de la cuenta, la hora en que ocurrió el problema, capturas de pantalla de mensajes de error, el método de inicio de sesión que estaba usando y detalles relevantes del dispositivo o navegador para que el problema pueda investigarse más rápido.",
      contactMainlandTitle: "China Continental",
      contactOverseasTitle: "Extranjero",
      contactPersonLabel: "Persona de contacto:",
      contactPhoneLabel: "Teléfono:",
      contactEmailLabel: "Correo electrónico:",
      contactHoursLabel: "Horas de soporte:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Lunes a viernes 09:00 - 18:00",
      contactOverseasPersonValue: "YOUR_NAME_OVERSEAS",
      contactOverseasPhoneValue: "YOUR_PHONE_NUMBER_OVERSEAS",
      contactOverseasEmailValue: "YOUR_EMAIL_OVERSEAS",
      contactOverseasHoursValue: "Lunes a viernes 09:00 - 18:00",
      contactRegionNotice:
        "Primero contacte el canal de soporte para su región. Si no está seguro de qué región aplica, comience con el contacto de China Continental para obtener ayuda de enrutamiento.",
      contactNotice:
        "Para problemas como cuentas congeladas, autorizaciones anormales, claves de acceso perdidas o recuperación de eliminación, primero contacte al administrador a través del número de teléfono o correo electrónico anterior. Si su plataforma proporciona un sistema de tickets oficial, tablón de anuncios o grupo de operaciones, siga ese canal oficial primero.",
    },
  },
} as const;

export default locale;
