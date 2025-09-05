<template>
    <a-card title="我的课程表" class="course-table-container">
      <a-table
        :columns="columns"
        :data-source="tableData"
        bordered
        size="middle"
        :pagination="false"
      >
        <!-- 渲染课程单元格 -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(column.dataIndex)">
            <div
              v-if="record[column.dataIndex]"
              :style="{ backgroundColor: record[column.dataIndex].color }"
              class="course-cell"
              :rowspan="record[column.dataIndex].rowSpan || 1"
            >
              {{ record[column.dataIndex].name }}<br />
              {{ record[column.dataIndex].teacher }}<br />
              {{ record[column.dataIndex].location }}
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { Card, Table } from 'ant-design-vue';
  
  // 原始课程数据，已添加 color 属性
  const rawCourses = ref([
    {
      name: '数据结构',
      week: '一',
      num: [1, 2],
      teacher: '李四',
      location: 'A102',
      color: '#FFA500', // 橙色
    },
    {
      name: '线性代数',
      week: '二',
      num: [3, 4],
      teacher: '高圆圆',
      location: 'E102',
      color: '#4682B4', // 钢蓝色
    },
    {
      name: '大学英语',
      week: '三',
      num: [5, 6],
      teacher: '王五',
      location: 'B203',
      color: '#32CD32', // 酸橙绿
    },
    {
      name: '计算机组成原理',
      week: '四',
      num: [7, 8],
      teacher: '赵六',
      location: 'C304',
      color: '#9370DB', // 中等紫色
    },
    {
      name: '计算机组成原理',
      week: '五',
      num: [5, 6],
      teacher: '赵六',
      location: 'C304',
      color: '#9370DB', // 同上
    },
  ]);
  
  // 星期映射
  const weekMap = {
    一: 'monday',
    二: 'tuesday',
    三: 'wednesday',
    四: 'thursday',
    五: 'friday',
  };
  
  // 所有节次：1 到 8
  const periods = ref([1, 2, 3, 4, 5, 6, 7, 8]);
  
  // 生成表格数据，并处理合并单元格的逻辑
  const tableData = computed(() => {
    // 创建一个二维数组，按天和节次组织课程
    const schedule = {};
  
    rawCourses.value.forEach((course) => {
      const dayKey = weekMap[course.week];
      if (!dayKey) return;
  
      course.num.forEach((period) => {
        const key = `${dayKey}_${period}`;
        if (!schedule[key]) {
          schedule[key] = [];
        }
        schedule[key].push({ ...course });
      });
    });
  
    // 构建表格数据
    const data = [];
    for (let period = 1; period <= 8; period++) {
      const row = {
        time: `第${period}节`,
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
      };
  
      // 周一
      const mondayKey = `monday_${period}`;
      if (schedule[mondayKey] && schedule[mondayKey].length > 0) {
        const firstCourse = schedule[mondayKey][0];
        row.monday = {
          ...firstCourse,
          rowSpan: schedule[mondayKey].length,
        };
      }
  
      // 周二
      const tuesdayKey = `tuesday_${period}`;
      if (schedule[tuesdayKey] && schedule[tuesdayKey].length > 0) {
        const firstCourse = schedule[tuesdayKey][0];
        row.tuesday = {
          ...firstCourse,
          rowSpan: schedule[tuesdayKey].length,
        };
      }
  
      // 周三
      const wednesdayKey = `wednesday_${period}`;
      if (schedule[wednesdayKey] && schedule[wednesdayKey].length > 0) {
        const firstCourse = schedule[wednesdayKey][0];
        row.wednesday = {
          ...firstCourse,
          rowSpan: schedule[wednesdayKey].length,
        };
      }
  
      // 周四
      const thursdayKey = `thursday_${period}`;
      if (schedule[thursdayKey] && schedule[thursdayKey].length > 0) {
        const firstCourse = schedule[thursdayKey][0];
        row.thursday = {
          ...firstCourse,
          rowSpan: schedule[thursdayKey].length,
        };
      }
  
      // 周五
      const fridayKey = `friday_${period}`;
      if (schedule[fridayKey] && schedule[fridayKey].length > 0) {
        const firstCourse = schedule[fridayKey][0];
        row.friday = {
          ...firstCourse,
          rowSpan: schedule[fridayKey].length,
        };
      }
  
      data.push(row);
    }
  
    return data;
  });
  
  // 表格列定义
  const columns = ref([
    { title: '节次', dataIndex: 'time', key: 'time', width: '80px' },
    { title: '周一', dataIndex: 'monday', key: 'monday' },
    { title: '周二', dataIndex: 'tuesday', key: 'tuesday' },
    { title: '周三', dataIndex: 'wednesday', key: 'wednesday' },
    { title: '周四', dataIndex: 'thursday', key: 'thursday' },
    { title: '周五', dataIndex: 'friday', key: 'friday' },
  ]);
  </script>
  
  <style scoped>
  .course-table-container {
    width: 100%;
    margin: 20px 0;
  }
  
  .course-cell {
    padding: 6px 4px;
    margin: 1px;
    color: white;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.3;
    text-align: left;
    white-space: pre-line;
  }
  </style>
  