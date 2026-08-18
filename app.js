/**
 * ============================================================================
 * SISTEMA DE AUTENTICACIÓN AVANZADO CON EXPORTACIÓN CSV - JS PURO (ES6+)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------------------------------
    // 1. SELECTORES DE ELEMENTOS DEL DOM
    // ------------------------------------------------------------------------
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const forgotView = document.getElementById('forgotView');
    const dashboardView = document.getElementById('dashboardView');
    const profileView = document.getElementById('profileView');

    const goToRegisterBtn = document.getElementById('goToRegister');
    const goToLoginBtn = document.getElementById('goToLogin');
    const goToForgotBtn = document.getElementById('goToForgot');
    const goToLoginFromForgot = document.getElementById('goToLoginFromForgot');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const toastContainer = document.getElementById('toastContainer');

    // Forms
    const loginForm = document.getElementById('loginForm');
    const loginIdentifierInput = document.getElementById('loginIdentifier');
    const loginPasswordInput = document.getElementById('loginPassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginAlert = document.getElementById('loginAlert');
    const lockoutBanner = document.getElementById('lockoutBanner');
    const lockoutTimerText = document.getElementById('lockoutTimerText');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');

    const registerForm = document.getElementById('registerForm');
    const regFullNameInput = document.getElementById('regFullName');
    const regEmailInput = document.getElementById('regEmail');
    const regUsernameInput = document.getElementById('regUsername');
    const regRoleSelect = document.getElementById('regRole');
    const regPasswordInput = document.getElementById('regPassword');
    const regConfirmPasswordInput = document.getElementById('regConfirmPassword');
    const registerAlert = document.getElementById('registerAlert');

    const forgotForm = document.getElementById('forgotForm');
    const forgotIdentifierInput = document.getElementById('forgotIdentifier');
    const resetFields = document.getElementById('resetFields');
    const newPasswordInput = document.getElementById('newPassword');
    const forgotSubmitBtn = document.getElementById('forgotSubmitBtn');
    const forgotAlert = document.getElementById('forgotAlert');

    // Dashboard & Profile
    const welcomeUserTitle = document.getElementById('welcomeUserTitle');
    const dashRoleBadge = document.getElementById('dashRoleBadge');
    const widgetUserRole = document.getElementById('widgetUserRole');
    const widgetLastLogin = document.getElementById('widgetLastLogin');
    const widgetNotifCount = document.getElementById('widgetNotifCount');
    const historyTableBody = document.getElementById('historyTableBody');
    const usersTableBody = document.getElementById('usersTableBody');
    const adminUsersTabBtn = document.getElementById('adminUsersTabBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    const goToProfileBtn = document.getElementById('goToProfileBtn');
    const backToDashBtn = document.getElementById('backToDashBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileForm = document.getElementById('profileForm');
    const profFullName = document.getElementById('profFullName');
    const profUsername = document.getElementById('profUsername');
    const profEmail = document.getElementById('profEmail');
    const profRole = document.getElementById('profRole');

    // Strength Meter
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const reqLength = document.getElementById('reqLength');
    const reqUpper = document.getElementById('reqUpper');
    const reqLower = document.getElementById('reqLower');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');

    // ------------------------------------------------------------------------
    // 2. KEYS DE STORAGE & ESTADO LOCAL
    // ------------------------------------------------------------------------
    const STORAGE_USERS_KEY = 'app_users_db_v2';
    const STORAGE_SESSION_KEY = 'app_active_session_v2';
    const STORAGE_THEME_KEY = 'app_user_theme';
    const STORAGE_ATTEMPTS_KEY = 'app_login_attempts';
    const STORAGE_LOCKOUT_KEY = 'app_lockout_until';
    const STORAGE_HISTORY_KEY = 'app_access_history';

    let lockoutTimerInterval = null;
    let recoveryUserFound = null;


    // ------------------------------------------------------------------------
    // 3. INICIALIZACIÓN
    // ------------------------------------------------------------------------
    function initApp() {
        seedAdminUser();
        initTheme();
        setupRealtimeValidation();
        checkActiveSession();
        checkLockoutStatus();
    }

    function seedAdminUser() {
        let users = getUsersFromStorage();
        if (users.length === 0) {
            const adminUser = {
                fullName: "Administrador Sistema",
                email: "admin@portal.com",
                username: "admin",
                password: "AdminPass123!",
                role: "Administrador",
                createdAt: new Date().toISOString()
            };
            users.push(adminUser);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        }
    }


    // ------------------------------------------------------------------------
    // 4. NOTIFICACIONES TOAST
    // ------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }


    // ------------------------------------------------------------------------
    // 5. NAVEGACIÓN Y PESTAÑAS (TABS)
    // ------------------------------------------------------------------------
    function switchView(targetView) {
        [loginView, registerView, forgotView, dashboardView, profileView].forEach(view => {
            if (view) {
                view.classList.add('hidden');
                view.classList.remove('active');
            }
        });

        hideAlert(loginAlert);
        hideAlert(registerAlert);
        hideAlert(forgotAlert);

        if (targetView) {
            targetView.classList.remove('hidden');
            setTimeout(() => targetView.classList.add('active'), 50);
        }
    }

    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerForm) registerForm.reset();
            clearValidationErrors(registerForm);
            resetPasswordStrengthMeter();
            switchView(registerView);
        });
    }

    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.reset();
            clearValidationErrors(loginForm);
            switchView(loginView);
        });
    }

    if (goToForgotBtn) {
        goToForgotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (forgotForm) forgotForm.reset();
            if (resetFields) resetFields.classList.add('hidden');
            if (forgotSubmitBtn) forgotSubmitBtn.textContent = "Verificar Usuario";
            recoveryUserFound = null;
            switchView(forgotView);
        });
    }

    if (goToLoginFromForgot) {
        goToLoginFromForgot.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(loginView);
        });
    }

    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            btn.classList.add('active');
            const targetTab = document.getElementById(btn.dataset.tab);
            if (targetTab) targetTab.classList.remove('hidden');
        });
    });


    // ------------------------------------------------------------------------
    // 6. VALIDACIÓN EN TIEMPO REAL
    // ------------------------------------------------------------------------
    function setupRealtimeValidation() {
        if (regEmailInput) {
            regEmailInput.addEventListener('input', () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (regEmailInput.value && !emailRegex.test(regEmailInput.value)) {
                    showError(regEmailInput, 'regEmailError', 'Formato de correo no válido');
                } else {
                    clearFieldError(regEmailInput, 'regEmailError');
                }
            });
        }

        if (regPasswordInput) {
            regPasswordInput.addEventListener('input', () => {
                evaluatePasswordStrength(regPasswordInput.value);
            });
        }

        if (regConfirmPasswordInput) {
            regConfirmPasswordInput.addEventListener('input', () => {
                if (regConfirmPasswordInput.value !== regPasswordInput.value) {
                    showError(regConfirmPasswordInput, 'regConfirmPasswordError', 'Las contraseñas no coinciden');
                } else {
                    clearFieldError(regConfirmPasswordInput, 'regConfirmPasswordError');
                }
            });
        }
    }

    function clearFieldError(inputElement, errorSpanId) {
        if (!inputElement) return;
        inputElement.classList.remove('invalid');
        inputElement.classList.add('valid');
        const errorSpan = document.getElementById(errorSpanId);
        if (errorSpan) errorSpan.textContent = '';
    }


    // ------------------------------------------------------------------------
    // 7. EXPORTACIÓN DE USUARIOS A CSV
    // ------------------------------------------------------------------------
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            const users = getUsersFromStorage();
            if (users.length === 0) {
                showToast('No hay usuarios para exportar', 'error');
                return;
            }

            let csvRows = ["Nombre Completo,Usuario,Correo Electronico,Rol,Fecha de Registro"];
            users.forEach(u => {
                const date = u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A';
                csvRows.push(`"${u.fullName}","${u.username}","${u.email}","${u.role}","${date}"`);
            });

            const csvString = csvRows.join("\n");
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Reporte_Usuarios_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('¡Archivo CSV exportado con éxito!', 'success');
        });
    }


    // ------------------------------------------------------------------------
    // 8. RECUPERACIÓN DE CONTRASEÑA
    // ------------------------------------------------------------------------
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const identifier = forgotIdentifierInput.value.trim().toLowerCase();

            if (!recoveryUserFound) {
                const users = getUsersFromStorage();
                const found = users.find(u => u.username === identifier || u.email === identifier);

                if (!found) {
                    showError(forgotIdentifierInput, 'forgotIdentifierError', 'No se encontró ningún usuario registrado');
                    return;
                }

                recoveryUserFound = found;
                if (resetFields) resetFields.classList.remove('hidden');
                if (forgotSubmitBtn) forgotSubmitBtn.textContent = "Restablecer Contraseña";
                showAlert(forgotAlert, 'alert-success', `Usuario verificado: ${found.fullName}. Ingresa tu nueva contraseña.`);
                clearFieldError(forgotIdentifierInput, 'forgotIdentifierError');

            } else {
                const newPass = newPasswordInput.value;
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;

                if (!passwordRegex.test(newPass)) {
                    showError(newPasswordInput, 'newPasswordError', 'Debe incluir minúscula, mayúscula, número, especial y 8+ caracteres');
                    return;
                }

                let users = getUsersFromStorage();
                const index = users.findIndex(u => u.username === recoveryUserFound.username);
                if (index !== -1) {
                    users[index].password = newPass;
                    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

                    showToast('Contraseña restablecida correctamente', 'success');
                    showAlert(forgotAlert, 'alert-success', '¡Contraseña actualizada! Redirigiendo al Login...');

                    setTimeout(() => {
                        switchView(loginView);
                    }, 1500);
                }
            }
        });
    }


    // ------------------------------------------------------------------------
    // 9. LÓGICA DE REGISTRO
    // ------------------------------------------------------------------------
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearValidationErrors(registerForm);

            const fullName = regFullNameInput.value.trim();
            const email = regEmailInput.value.trim().toLowerCase();
            const username = regUsernameInput.value.trim().toLowerCase();
            const role = regRoleSelect ? regRoleSelect.value : 'Usuario';
            const password = regPasswordInput.value;
            const confirmPassword = regConfirmPasswordInput.value;

            let isValid = true;
            if (!fullName) { showError(regFullNameInput, 'regFullNameError', 'El nombre es obligatorio'); isValid = false; }
            if (!email) { showError(regEmailInput, 'regEmailError', 'El correo es obligatorio'); isValid = false; }
            if (!username) { showError(regUsernameInput, 'regUsernameError', 'El usuario es obligatorio'); isValid = false; }
            if (!password) { showError(regPasswordInput, 'regPasswordError', 'La contraseña es obligatoria'); isValid = false; }
            if (!confirmPassword) { showError(regConfirmPasswordInput, 'regConfirmPasswordError', 'Confirme su contraseña'); isValid = false; }

            if (!isValid) return;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError(regEmailInput, 'regEmailError', 'Formato de correo no válido');
                return;
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;
            if (!passwordRegex.test(password)) {
                showError(regPasswordInput, 'regPasswordError', 'La contraseña no cumple los requisitos de seguridad');
                return;
            }

            if (password !== confirmPassword) {
                showError(regConfirmPasswordInput, 'regConfirmPasswordError', 'Las contraseñas no coinciden');
                return;
            }

            const users = getUsersFromStorage();
            if (users.some(u => u.email === email)) { showError(regEmailInput, 'regEmailError', 'Correo ya registrado'); return; }
            if (users.some(u => u.username === username)) { showError(regUsernameInput, 'regUsernameError', 'Nombre de usuario no disponible'); return; }

            const newUser = {
                fullName,
                email,
                username,
                role,
                password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

            showToast('¡Registro completado exitosamente!', 'success');
            showAlert(registerAlert, 'alert-success', 'Cuenta creada con éxito. Redirigiendo al login...');

            setTimeout(() => {
                registerForm.reset();
                resetPasswordStrengthMeter();
                switchView(loginView);
            }, 1200);
        });
    }


    // ------------------------------------------------------------------------
    // 10. LOGIN, RECORDAR SESIÓN E HISTORIAL DE ACCESOS
    // ------------------------------------------------------------------------
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (isLockedOut()) return;

            clearValidationErrors(loginForm);
            const identifier = loginIdentifierInput.value.trim().toLowerCase();
            const password = loginPasswordInput.value;
            const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

            let isValid = true;
            if (!identifier) { showError(loginIdentifierInput, 'loginIdentifierError', 'Ingrese usuario o correo'); isValid = false; }
            if (!password) { showError(loginPasswordInput, 'loginPasswordError', 'Ingrese contraseña'); isValid = false; }

            if (!isValid) return;

            const users = getUsersFromStorage();
            const userFound = users.find(u => u.username === identifier || u.email === identifier);

            if (!userFound || userFound.password !== password) {
                handleFailedAttempt();
                recordAccessHistory(identifier || 'Desconocido', 'Fallido');
                showAlert(loginAlert, 'alert-error', 'Usuario o contraseña incorrectos.');
                return;
            }

            resetFailedAttempts();
            saveSession(userFound, remember);
            recordAccessHistory(userFound.username, 'Exitoso');

            showToast(`¡Bienvenido de nuevo, ${userFound.fullName}!`, 'success');
            showAlert(loginAlert, 'alert-success', 'Inicio de sesión correcto.');

            setTimeout(() => {
                loginForm.reset();
                loadDashboardData(userFound);
                switchView(dashboardView);
            }, 1000);
        });
    }

    function saveSession(user, remember) {
        const sessionData = {
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            role: user.role,
            remember: remember,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
    }

    function recordAccessHistory(username, status) {
        let history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || '[]');
        history.unshift({
            username: username,
            timestamp: new Date().toLocaleString(),
            status: status,
            ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            browser: navigator.userAgent.includes("Chrome") ? "Google Chrome" : "Navegador Web"
        });
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    }


    // ------------------------------------------------------------------------
    // 11. DASHBOARD, PERFIL Y CONTROL DE ROLES
    // ------------------------------------------------------------------------
    function checkActiveSession() {
        const activeSession = localStorage.getItem(STORAGE_SESSION_KEY);
        if (activeSession) {
            try {
                const user = JSON.parse(activeSession);
                loadDashboardData(user);
                switchView(dashboardView);
            } catch (e) {
                logout();
            }
        } else {
            switchView(loginView);
        }
    }

    function loadDashboardData(user) {
        if (welcomeUserTitle) welcomeUserTitle.textContent = `¡Bienvenido, ${user.fullName}!`;
        if (dashRoleBadge) dashRoleBadge.textContent = `Rol: ${user.role}`;
        if (widgetUserRole) widgetUserRole.textContent = user.role;
        if (widgetLastLogin) widgetLastLogin.textContent = new Date().toLocaleTimeString();
        if (widgetNotifCount) widgetNotifCount.textContent = "1 Notificación";

        renderHistoryTable(user.username);

        if (user.role === 'Administrador') {
            if (adminUsersTabBtn) adminUsersTabBtn.classList.remove('hidden');
            renderAdminUsersTable();
        } else {
            if (adminUsersTabBtn) adminUsersTabBtn.classList.add('hidden');
        }

        if (profFullName) profFullName.value = user.fullName;
        if (profUsername) profUsername.value = user.username;
        if (profEmail) profEmail.value = user.email;
        if (profRole) profRole.value = user.role;
        const avatarLarge = document.getElementById('profileAvatarLarge');
        if (avatarLarge) avatarLarge.textContent = user.fullName.charAt(0).toUpperCase();
    }

    function renderHistoryTable(username) {
        if (!historyTableBody) return;
        const history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || '[]');
        const userHistory = history.filter(h => h.username === username || username === 'admin');

        historyTableBody.innerHTML = userHistory.map(h => `
            <tr>
                <td>${h.timestamp}</td>
                <td><span class="${h.status === 'Exitoso' ? 'badge-success' : 'error-msg'}">${h.status}</span></td>
                <td>${h.ip}</td>
                <td>${h.browser}</td>
            </tr>
        `).join('') || '<tr><td colspan="4">Sin registros de acceso.</td></tr>';
    }

    function renderAdminUsersTable() {
        if (!usersTableBody) return;
        const users = getUsersFromStorage();
        usersTableBody.innerHTML = users.map(u => `
            <tr>
                <td>${u.fullName}</td>
                <td>@${u.username}</td>
                <td>${u.email}</td>
                <td><strong>${u.role}</strong></td>
                <td>
                    ${u.username !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u.username}')">Eliminar</button>` : '<em>Protegido</em>'}
                </td>
            </tr>
        `).join('');
    }

    window.deleteUser = function(username) {
        if (confirm(`¿Estás seguro de eliminar al usuario @${username}?`)) {
            let users = getUsersFromStorage().filter(u => u.username !== username);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
            renderAdminUsersTable();
            showToast(`Usuario @${username} eliminado`, 'success');
        }
    };

    if (goToProfileBtn) goToProfileBtn.addEventListener('click', () => switchView(profileView));
    if (backToDashBtn) backToDashBtn.addEventListener('click', () => switchView(dashboardView));

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = profFullName.value.trim();
            const newEmail = profEmail.value.trim();

            if (!newName || !newEmail) {
                showToast('Todos los campos son obligatorios', 'error');
                return;
            }

            let users = getUsersFromStorage();
            const activeSession = JSON.parse(localStorage.getItem(STORAGE_SESSION_KEY));
            const userIndex = users.findIndex(u => u.username === activeSession.username);

            if (userIndex !== -1) {
                users[userIndex].fullName = newName;
                users[userIndex].email = newEmail;
                localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

                activeSession.fullName = newName;
                activeSession.email = newEmail;
                localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(activeSession));

                showToast('Perfil actualizado con éxito', 'success');
                loadDashboardData(activeSession);
            }
        });
    }

    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    function logout() {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        switchView(loginView);
        showToast('Sesión cerrada correctamente', 'info');
    }


    // ------------------------------------------------------------------------
    // 12. MODO OSCURO, BLOQUEO DE INTENTOS Y EVALUADOR DE CONTRASEÑA
    // ------------------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(STORAGE_THEME_KEY, newTheme);
        });
    }

    function evaluatePasswordStrength(password) {
        const hasLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[@$!%*?&._-]/.test(password);

        updateReq(reqLength, hasLength, "Mínimo 8 caracteres");
        updateReq(reqUpper, hasUpper, "Al menos una letra mayúscula");
        updateReq(reqLower, hasLower, "Al menos una letra minúscula");
        updateReq(reqNumber, hasNumber, "Al menos un número");
        updateReq(reqSpecial, hasSpecial, "Al menos un carácter especial");

        let score = (hasLength?1:0) + (hasUpper?1:0) + (hasLower?1:0) + (hasNumber?1:0) + (hasSpecial?1:0);

        if (strengthBar && strengthText) {
            if (score <= 2) {
                strengthBar.style.width = '33%'; strengthBar.style.backgroundColor = 'var(--danger-color)';
                strengthText.textContent = 'Seguridad: Débil 🔴';
            } else if (score <= 4) {
                strengthBar.style.width = '66%'; strengthBar.style.backgroundColor = 'var(--warning-color)';
                strengthText.textContent = 'Seguridad: Media 🟡';
            } else {
                strengthBar.style.width = '100%'; strengthBar.style.backgroundColor = 'var(--success-color)';
                strengthText.textContent = 'Seguridad: Fuerte 🟢';
            }
        }
    }

    function updateReq(el, valid, txt) {
        if (!el) return;
        el.textContent = `${valid ? '✔' : '✖'} ${txt}`;
        el.className = valid ? 'fulfilled' : '';
    }

    function resetPasswordStrengthMeter() {
        if (strengthBar) strengthBar.style.width = '0%';
        if (strengthText) strengthText.textContent = 'Seguridad: No ingresada';
    }

    function handleFailedAttempt() {
        const existingLockoutUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0');

        // Si ya hay un bloqueo activo, no se reinicia el contador a 30 segundos.
        if (existingLockoutUntil && Date.now() < existingLockoutUntil) {
            startLockoutCountdown();
            return;
        }

        let attempts = Number(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '0') + 1;
        localStorage.setItem(STORAGE_ATTEMPTS_KEY, String(attempts));

        if (attempts >= 3) {
            const lockoutUntil = Date.now() + 30000;
            localStorage.setItem(STORAGE_LOCKOUT_KEY, String(lockoutUntil));
            startLockoutCountdown();
        }
    }

    function isLockedOut() {
        const lockoutUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0');

        if (!lockoutUntil) {
            return false;
        }

        if (Date.now() >= lockoutUntil) {
            resetFailedAttempts();
            return false;
        }

        startLockoutCountdown();
        return true;
    }

    function checkLockoutStatus() {
        const lockoutUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0');

        if (lockoutUntil && Date.now() < lockoutUntil) {
            startLockoutCountdown();
            return;
        }

        resetFailedAttempts();
    }

    function startLockoutCountdown() {
        clearInterval(lockoutTimerInterval);

        const renderCountdown = () => {
            const lockoutUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0');
            const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));

            if (!lockoutUntil || remaining <= 0) {
                resetFailedAttempts();
                if (loginAlert) hideAlert(loginAlert);
                showToast('El bloqueo terminó. Ya puedes intentar iniciar sesión nuevamente.', 'info');
                return;
            }

            if (loginSubmitBtn) loginSubmitBtn.disabled = true;
            if (lockoutBanner) lockoutBanner.classList.remove('hidden');
            if (lockoutTimerText) {
                lockoutTimerText.textContent = `Sistema bloqueado por intentos fallidos. Espere ${remaining}s.`;
            }
        };

        // Primer render inmediato para evitar que el mensaje se quede fijo en 30s.
        renderCountdown();

        lockoutTimerInterval = setInterval(() => {
            const lockoutUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0');
            const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));

            if (!lockoutUntil || remaining <= 0) {
                resetFailedAttempts();
                if (loginAlert) hideAlert(loginAlert);
                showToast('El bloqueo terminó. Ya puedes intentar iniciar sesión nuevamente.', 'info');
                return;
            }

            if (lockoutTimerText) {
                lockoutTimerText.textContent = `Sistema bloqueado por intentos fallidos. Espere ${remaining}s.`;
            }
        }, 1000);
    }

    function resetFailedAttempts() {
        localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        localStorage.removeItem(STORAGE_LOCKOUT_KEY);
        clearInterval(lockoutTimerInterval);
        lockoutTimerInterval = null;

        if (loginSubmitBtn) loginSubmitBtn.disabled = false;
        if (lockoutBanner) lockoutBanner.classList.add('hidden');
        if (lockoutTimerText) lockoutTimerText.textContent = '';
    }

    // Helpers
    function getUsersFromStorage() { return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]'); }
    function showError(inp, id, msg) { if (inp) inp.classList.add('invalid'); const s = document.getElementById(id); if (s) s.textContent = msg; }
    function clearValidationErrors(f) { if (!f) return; f.querySelectorAll('input').forEach(i => i.classList.remove('invalid', 'valid')); f.querySelectorAll('.error-msg').forEach(s => s.textContent = ''); }
    function showAlert(el, cls, msg) { if (!el) return; el.className = `alert-box ${cls}`; el.textContent = msg; el.classList.remove('hidden'); }
    function hideAlert(el) { if (el) el.classList.add('hidden'); }

    // Toggle Passwords
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const inp = btn.previousElementSibling;
            if (inp && inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
            else if (inp) { inp.type = 'password'; btn.textContent = '👁️'; }
        });
    });

    initApp();
});
