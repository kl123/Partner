<template>
  <div class="login-container">
    <!-- 顶部背景区域 -->
    <div class="top-bg"></div>

    <!-- 登录/注册选项卡 -->
    <div class="tab-container">
      <img class="tab-decoration" src="../assets/logo.png" />
      
      <div class="tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 0 }"
          @click="switchTab(0)"
        >
          <span>登录</span>
          <div class="indicator" v-show="activeTab === 0"></div>
        </div>
        
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 1 }"
          @click="switchTab(1)"
        >
          <span>注册</span>
          <div class="indicator" v-show="activeTab === 1"></div>
        </div>
      </div>
    </div>

    <!-- 登录表单 -->
    <div class="form-container" v-if="activeTab === 0">
      <div class="form-item">
        <input 
          v-model="loginForm.username"
          type="text" 
          maxlength="11" 
          placeholder="请输入您的手机号/邮箱" 
        />
      </div>
      
      <div class="form-item">
        <input 
          v-model="loginForm.password"
          type="password" 
          placeholder="请输入您的登录密码" 
        />
      </div>
      
      <button class="submit-btn" @click="handleLogin">立即登录</button>
      
      <div class="forgot-password">
        <span @click="handleForgotPassword">忘记密码？</span>
      </div>
    </div>

    <!-- 注册表单 -->
    <div class="form-container" v-else>
      <div class="form-item">
        <input 
          v-model="registerForm.username"
          type="text" 
          maxlength="11" 
          placeholder="请输入您的手机号/邮箱" 
        />
      </div>
      
      <div class="form-item">
        <input 
          v-model="registerForm.password"
          type="password" 
          placeholder="请输入您的登录密码" 
        />
      </div>
      
      <div class="form-item">
        <input 
          v-model="registerForm.confirmPassword"
          type="password" 
          placeholder="请再次输入密码" 
        />
      </div>
      
      <button class="submit-btn" @click="handleRegister">立即注册</button>
    </div>

    <!-- 其他登录方式 -->
    <div class="other-login">
      <div class="divider">
        <div class="line"></div>
        <span>更多登录方式</span>
        <div class="line"></div>
      </div>
      
      <div class="login-methods">
        <img class="method-icon" src="../assets/wx.jpg" alt="微信登录" />
        <img class="method-icon" src="../assets/QQ.webp" alt="QQ登录" />
        <img class="method-icon" src="../assets/zfb.png" alt="支付宝登录" />
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
        this.$router.push('/home') // 跳转到首页
      }
      // this.$api.login(this.loginForm).then(...)
      // const res1 = await test()
      // console.log(res1);
    },
    
    // 处理注册
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
      
      // 这里调用注册API
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

<style lang="scss" scoped>
.login-container {
  width: 100%;
  min-height: 90vh;
  background-color: #f8f8f8;
  position: relative;
  padding-bottom: 50px;
  
  .top-bg {
    width: 100%;
    height: 200px;
    background-color: #5064eb;
  }
  
  .tab-container {
    width: calc(100% - 40px);
    height: 120px;
    background-color: #fff;
    margin: -60px 20px 0;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .tab-decoration {
      position: absolute;
      top: -120px;
      right: 15%;
      width: 220px;
      height: 142px;
    }
    
    .tabs {
      display: flex;
      width: 100%;
      justify-content: center;
      
      .tab-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 40px;
        cursor: pointer;
        
        span {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 10px;
          color: #333;
        }
        
        .indicator {
          width: 20px;
          height: 3px;
          background-color: #5064eb;
          border-radius: 2px;
        }
        
        &.active {
          span {
            color: #5064eb;
            font-size: 20px;
          }
        }
      }
    }
  }
  
  .form-container {
    width: calc(100% - 40px);
    margin: 40px 20px 0;
    
    .form-item {
      display: flex;
      align-items: center;
      width: 100%;
      height: 50px;
      background-color: rgba(80, 100, 235, 0.1);
      border-radius: 25px;
      margin-bottom: 20px;
      padding: 0 20px;
      
      .icon {
        width: 20px;
        height: 20px;
        margin-right: 15px;
      }
      
      input {
        flex: 1;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        font-size: 14px;
        color: #5064eb;
        
        &::placeholder {
          color: #5064eb;
          opacity: 0.6;
        }
      }
    }
    
    .submit-btn {
      width: 100%;
      height: 50px;
      background-color: #5064eb;
      border: none;
      border-radius: 25px;
      color: white;
      font-size: 16px;
      font-weight: 500;
      margin-top: 20px;
      cursor: pointer;
      
      &:active {
        opacity: 0.8;
      }
    }
    
    .forgot-password {
      text-align: center;
      margin-top: 15px;
      
      span {
        color: #5064eb;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
  
  .other-login {
    margin-top: 50px;
    padding: 0 20px;
    
    .divider {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      
      .line {
        flex: 1;
        height: 1px;
        background-color: #eee;
      }
      
      span {
        font-size: 14px;
        color: #999;
        margin: 0 15px;
      }
    }
    
    .login-methods {
      display: flex;
      justify-content: center;
      
      .method-icon {
        width: 40px;
        height: 40px;
        margin: 0 20px;
        cursor: pointer;
      }
    }
  }
}
</style>