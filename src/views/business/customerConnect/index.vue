<template>
  <div class="app-container">

    <div class="box" style="display: flex;justify-content: space-between;">
      <div class="left">
        <div style="color: #1ab394;font-weight: 700;margin-bottom: 10px;">客户名称：{{ user.customerName }}</div>
        <div style="color: #1ab394;font-weight: 700;margin-bottom: 10px;">客户电话：{{ user.customerPhone }}</div>
      </div>
      <div class="right">
        <div>
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
        </div>
        <div style="margin-top: 10px">
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

    <el-table v-loading="loading" :data="customerConnectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="录入用户" align="center" prop="userName"/>
      <el-table-column label="客户名称" align="center" prop="customerName"/>
      <el-table-column label="回访内容" align="center" prop="content"/>
      <el-table-column label="回访时间" align="center" prop="createTime"/>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改客户沟通记录对话框 -->
    <el-dialog :title="title" v-model="open" append-to-body>
      <el-form ref="customerConnectRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="沟通内容">
          <el-input type="textarea" v-model="form.content" placeholder="请输入沟通内容"/>
        </el-form-item>
        <el-form-item label="到期时间" prop="endTime">
          <el-date-picker clearable
                          prefix-icon="CircleClose1"
                          v-model="form.endTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择到期时间">
          </el-date-picker>
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

<script setup name="CustomerConnect">
import {
  listCustomerConnect,
  getCustomerConnect,
  delCustomerConnect,
  addCustomerConnect,
  updateCustomerConnect
} from "@/api/business/customerConnect";

const {proxy} = getCurrentInstance();

const props = defineProps({
  user: {
    type: Object,
  },
  list: {
    type: Array
  },
  customerConnectTotal: {
    type: Number
  }
});

const customerConnectList = ref(props.list);
const open = ref(false);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(props.customerConnectTotal);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    userName: null,
    customerName: null,
    content: null,
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询客户沟通记录列表 */
function getList() {
  loading.value = true;
  queryParams.value.customerId = props.user.customerId
  listCustomerConnect(queryParams.value).then(response => {
    customerConnectList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    customerConnectId: null,
    userId: null,
    userName: null,
    customerId: null,
    content: null,
    createTime: null,
    endTime:null
  };
  proxy.resetForm("customerConnectRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  // getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.customerConnectId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdds() {
  reset();
  open.value = true;
  title.value = "添加客户沟通记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _customerConnectId = row.customerConnectId || ids.value
  getCustomerConnect(_customerConnectId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户沟通记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerConnectRef"].validate(valid => {
    if (valid) {
      form.value.customerId = props.user.customerId
      form.value.customerName = props.user.customerName
      form.value.bookId = props.user.bookId
      if (form.value.customerConnectId != null) {
        updateCustomerConnect(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomerConnect(form.value).then(response => {
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
  const _customerConnectIds = row.customerConnectId || ids.value;
  proxy.$modal.confirm('是否确认删除客户沟通记录编号为"' + _customerConnectIds + '"的数据项？').then(function () {
    return delCustomerConnect(_customerConnectIds);
  }).then(() => {
    // getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/customerConnect/export', {
    ...queryParams.value
  }, `customerConnect_${new Date().getTime()}.xlsx`)
}

function openUrl(url) {
  window.open(url)
}

// getList();
</script>
