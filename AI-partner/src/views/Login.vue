<template>
  <div class="app-container">
    <div class="content-wrapper">
      <div class="header-section">
        <div class="text-area">
          <h1 class="main-title">
            <span class="title-line">嘿！</span>
            <span class="title-line">赶紧登录吧！</span>
          </h1>
          <p class="welcome-text">欢迎回来～我们等你好久了！</p>
        </div>
        <div class="logo-placeholder">
          <img class="logo-shape" src="../assets/logo.png" />
        </div>
      </div>

      <form class="login-form">
        <div class="form-group">
          <input 
            v-model="loginForm.username"
            type="text" 
            class="form-input" 
            placeholder="邮箱"
          >
        </div>
        <div class="password-wrapper">
          <div class="form-group password-group">
            <input 
              v-model="loginForm.password"
              type="password" 
              class="form-input" 
              placeholder="密码"
            >
            <button type="button" class="toggle-password">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V12M12 8V5M2 9C2 6.13401 4.13401 4 7 4C8.35685 4 9.57864 4.56066 10.4531 5.44508C11.3276 6.3295 11.7653 7.45129 11.7653 8.70711C11.7653 9.96292 11.3276 11.0847 10.4531 11.9691C9.57864 12.8536 8.35685 13.4143 7 13.4143C4.13401 13.4143 2 11.2797 2 8.41421V9Z" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <button type="button" class="independent-fingerprint-btn">
            <img src="../assets/指纹.png" alt="指纹登录" width="24" height="24" />
          </button>
        </div>
        <a href="#" class="forgot-link" @click="handleForgotPassword">忘记密码?</a>
        <button type="button" class="login-btn" @click="handleLogin">登录</button>
      </form>

      <div class="third-party-section">
        <div class="divider-container">
          <div class="divider-line"></div>
          <div class="third-party-title-container">
            <p class="third-party-title">第三方登录</p>
          </div>
          <div class="divider-line"></div>
        </div>
        <div class="social-icons">
          <a href="#" class="social-icon">
          <img class="social-icon" src="../assets/QQ.png" alt="QQ登录" />
          </a>
          <a href="#" class="social-icon">
          <img class="social-icon" src="../assets/wx.png" alt="微信登录" />
          </a>
        </div>
      </div>

      <div class="register-section">
        <p>没有账号? <a href="#" class="register-link">点击这里</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/Login'

export default {
  name: 'LoginPage',
  data() {
    return {
      activeTab: 0, // 0-登录 1-注册
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    // 切换选项卡
    switchTab(tabIndex) {
      this.activeTab = tabIndex
    },
    
    // 处理登录
    async handleLogin() {
      if (!this.loginForm.username) {
        this.$toast('请输入用户名')
        return
      }
      
      if (!this.loginForm.password) {
        this.$toast('请输入密码')
        return
      }
      
      // 这里调用登录API
      console.log('登录信息:', this.loginForm)
      const res =  await login(this.loginForm)
      const token = res.data
      console.log(res.data);
      localStorage.setItem('token', token)
      if (res.code==1) {
        localStorage.setItem("username",this.$data.loginForm.username)
        this.$router.push('/home') // 跳转到首页
      }
    },
    
    handleRegister() {
      if (!this.registerForm.username) {
        this.$toast('请输入用户名')
        return
      }
      
      if (!this.registerForm.password) {
        this.$toast('请输入密码')
        return
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.$toast('两次输入的密码不一致')
        return
      }
      
      console.log('注册信息:', this.registerForm)
      // this.$api.register(this.registerForm).then(...)
    },
    
    // 忘记密码
    handleForgotPassword() {
      this.$router.push('/forgot-password')
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%; /* 占满视口高度 */
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, #e6d9ff 0%, #d0ebff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 2.8rem;
  box-sizing: border-box;
}

/* 标题与Logo区域 - 核心修改：增加文字上下边距 */
.header-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.8rem;
  width: 100%;
}

.text-area {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 增加标题与欢迎语的上下间距 */
  text-align: left;
  margin: 0.5rem 0; /* 增加整个文字区域的上下外边距 */
}

.main-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem; /* 增加“嘿！”与“赶紧登录吧！”的上下间距 */
}

.title-line {
  display: block;
  line-height: 1.4; /* 优化单句行高，避免拥挤 */
}

.welcome-text {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  opacity: 0.8;
  line-height: 1.6; /* 优化欢迎语行高，提升可读性 */
  padding-top: 0.2rem; /* 微调与上方标题的间距 */
}

.logo-placeholder {
  width: 110px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-shape {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: circle(50% at 50% 50%);
}

/* 表单区域 - 居中+80%宽度，圆框样式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  width: 80%;
  margin: 0 auto;
}

.form-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 999px; /* 圆框样式 */
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: left;
}

.form-input::placeholder {
  color: #999;
  opacity: 0.8;
}

.password-wrapper {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.password-group {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.independent-fingerprint-btn {
  width: 50px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.independent-fingerprint-btn:hover {
  transform: scale(1.05);
}

.forgot-link {
  font-size: 0.8rem;
  color: #666;
  text-decoration: none;
  align-self: flex-end;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #6c5ce7;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 999px; /* 圆框样式 */
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.login-btn:hover {
  background: #5a47e0;
  transform: translateY(-2px);
}

.login-btn:active {
  transform: translateY(0);
}

.third-party-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
}

.divider-container {
  display: flex;
  align-items: center;
  width: 70%;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #333; /* 黑色延伸线条 */
}

.third-party-title-container {
  background-color: white;
  padding: 0.3rem 1.5rem;
  margin: 0 0.8rem;
  border-radius: 999px; /* 圆弧白底核心样式 */
}

.third-party-title {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.social-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.8rem;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.social-icon:hover {
  transform: scale(1.05);
}

.register-section {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  width: 100%;
}

.register-link {
  color: #6c5ce7;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #5a47e0;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .content-wrapper {
    gap: 2.2rem;
  }
  
  .header-section {
    gap: 1.5rem;
  }
  
  .main-title {
    font-size: 1.6rem;
    gap: 0.6rem; /* 移动端缩小标题内部间距 */
  }
  
  .text-area {
    gap: 0.8rem; /* 移动端缩小标题与欢迎语间距 */
    margin: 0.3rem 0;
  }
  
  .welcome-text {
    font-size: 0.8rem;
  }
  
  .form-input {
    padding: 0.9rem;
  }
  
  .login-btn {
    padding: 0.9rem;
  }
  
  .social-icon {
    width: 44px;
    height: 44px;
  }
  
  .social-icons {
    gap: 1.5rem;
  }
  
  .login-form {
    width: 90%;
  }
  
  .divider-container {
    width: 80%;
  }
  
  .independent-fingerprint-btn {
    width: 40px;
    height: 40px;
  }
  
  .password-wrapper {
    gap: 0.6rem;
  }
}
</style>