<template>
  <div class="app-container">
    <div class="box" style="display: flex;justify-content: space-between;">
      <div class="left" style="display: flex;">
        <div style="color: #1ab394;font-weight: 700;margin-bottom: 10px;">企业名称：{{ dataObj.translateName }}</div>
        <div style="color: #1ab394;font-weight: 700;margin-bottom: 10px;margin-left: 20px;">
          企业电话：{{ dataObj.phone }}
        </div>
      </div>
      <div class="right">
        <el-button
            type="primary"
            plain
            @click="openUrl('http://61.243.11.146:88/Web/dataapp/per_dataResult.aspx')"
        >二建注册查询
        </el-button>
        <el-button
            type="primary"
            plain
            @click="openUrl('https://zlaq.mohurd.gov.cn/fwmh/bjxcjgl/fwmh/pages/construction_safety/qyaqscglry/qyaqscglry.html')"
        >三类人员查询
        </el-button>
        <el-button
            type="primary"
            plain
            @click="openUrl('https://smrz.zwfw.guizhou.gov.cn/sso/login?utype=1&client_id=5GLA5D6XD&goto=165')"
        >二建系统登陆
        </el-button>
        <el-button
            type="primary"
            plain
            @click="openUrl('http://61.243.11.50:8088/GZZHXT/Index.html')"
        >三类人员登陆系统
        </el-button>

      </div>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdds"
        >新增
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="translateConnectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="录入用户" align="center" prop="userName"/>
      <el-table-column label="企业名称" align="center" prop="translateName"/>
      <el-table-column label="回访内容" align="center" prop="content"/>
      <el-table-column label="回访时间" align="center" prop="createTime"/>
      <!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
      <!--        <template #default="scope">-->
      <!--          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:translateConnect:edit']">修改</el-button>-->
      <!--          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:translateConnect:remove']">删除</el-button>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改企业沟通记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="translateConnectRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="沟通内容">
          <el-input type="textarea" v-model="form.content" placeholder="请输入沟通内容"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TranslateConnect">
import {
  listTranslateConnect,
  getTranslateConnect,
  delTranslateConnect,
  addTranslateConnect,
  updateTranslateConnect
} from "@/api/business/translateConnect";

const {proxy} = getCurrentInstance();

const props = defineProps({
  dataObj: {
    type: Object,
  },
});

const translateConnectList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    userName: null,
    translateId: null,
    content: null,
    translateName: null
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询企业沟通记录列表 */
function getList() {
  loading.value = true;
  queryParams.value.translateId = props.dataObj.translateId
  listTranslateConnect(queryParams.value).then(response => {
    translateConnectList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

function openUrl(url){
  window.open(url)
}

// 表单重置
function reset() {
  form.value = {
    translateConnectId: null,
    userId: null,
    userName: null,
    translateId: null,
    content: null,
    createTime: null,
    translateName: null
  };
  proxy.resetForm("translateConnectRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.translateConnectId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdds() {
  reset();
  open.value = true;
  title.value = "添加企业沟通记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _translateConnectId = row.translateConnectId || ids.value
  getTranslateConnect(_translateConnectId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改企业沟通记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["translateConnectRef"].validate(valid => {
    if (valid) {
      form.value.translateId = props.dataObj.translateId
      form.value.translateName = props.dataObj.translateName
      if (form.value.translateConnectId != null) {
        updateTranslateConnect(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTranslateConnect(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _translateConnectIds = row.translateConnectId || ids.value;
  proxy.$modal.confirm('是否确认删除企业沟通记录编号为"' + _translateConnectIds + '"的数据项？').then(function () {
    return delTranslateConnect(_translateConnectIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/translateConnect/export', {
    ...queryParams.value
  }, `translateConnect_${new Date().getTime()}.xlsx`)
}

getList();
</script>
