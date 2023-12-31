<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业名称" prop="translateName">
        <el-input
          v-model="queryParams.translateName"
          placeholder="请输入企业名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px;">
        <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            v-hasPermi="['business:translate:remove']"
            @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="Upload"
            @click="handleImport"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            :disabled="multiple"
            icon="Finished"
            @click="getBookIds"
        >批量领取</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="translateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="translateName" />
      <el-table-column label="联系人" align="center" prop="contacts" />
      <el-table-column label="联系电话" align="center" prop="pass" />
      <el-table-column label="省份-城市" align="center" prop="addr" />
      <el-table-column label="客户需求" align="center" prop="customerDemand" />
      <el-table-column label="客户来源" align="center" prop="sources" />
      <el-table-column label="备注" align="center" prop="notes" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-if="scope.row.isUse == 0" link type="primary" @click="handleGet(scope.row)" v-hasPermi="['business:translate:edit']">领取</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:translate:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:translate:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改企业资源对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="translateRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="企业名称" prop="translateName">
          <el-input v-model="form.translateName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contacts">
          <el-input v-model="form.contacts" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="省份-城市" prop="addr">
          <el-input v-model="form.addr" placeholder="请输入省份-城市" />
        </el-form-item>
        <el-form-item label="客户需求" prop="customerDemand">
          <el-input v-model="form.customerDemand" placeholder="请输入客户需求" />
        </el-form-item>
        <el-form-item label="客户来源" prop="sources">
          <el-input v-model="form.sources" placeholder="请输入客户来源" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="form.notes" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
          ref="uploadRef"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url + '?updateSupport=' + upload.updateSupport"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Translate">
import { getToken } from "@/utils/auth";
import { listTranslate, getTranslate, delTranslate, addTranslate, updateTranslate,getBookTranslate,getBookTranslateIds } from "@/api/business/translate";

const { proxy } = getCurrentInstance();
const { is_use } = proxy.useDict('is_use');

const translateList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/business/translate/importData"
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    translateName: null,
    contacts: null,
    phone: null,
    addr: null,
    customerDemand: null,
    sources: null,
    isUse: null,
    isDel: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询企业资源列表 */
function getList() {
  loading.value = true;
  listTranslate(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    translateList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}


/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
};
/** 下载模板操作 */
function importTemplate() {
  proxy.download("business/translate/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    translateId: null,
    translateName: null,
    contacts: null,
    phone: null,
    addr: null,
    customerDemand: null,
    sources: null,
    createBy: null,
    createTime: null,
    isUse: null,
    isDel: null,
    notes: null
  };
  proxy.resetForm("translateRef");
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
  ids.value = selection.map(item => item.translateId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加企业资源";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _translateId = row.translateId || ids.value
  getTranslate(_translateId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改企业资源";
  });
}
/** 领取按钮操作 */
function handleGet(row) {
  getBookTranslate(row).then(response => {
    proxy.$modal.msgSuccess("领取成功");
    open.value = false;
    getList();
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["translateRef"].validate(valid => {
    if (valid) {
      if (form.value.translateId != null) {
        updateTranslate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTranslate(form.value).then(response => {
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
  const _translateIds = row.translateId || ids.value;
  proxy.$modal.confirm('是否确认删除企业资源编号为"' + _translateIds + '"的数据项？').then(function() {
    return delTranslate(_translateIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

//批量领取
function getBookIds(row){
  const _translateIds = row.translateId || ids.value;
  getBookTranslateIds(_translateIds).then(response => {
    proxy.$modal.msgSuccess("领取成功");
    open.value = false;
    getList();
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/translate/export', {
    ...queryParams.value
  }, `translate_${new Date().getTime()}.xlsx`)
}

getList();
</script>
