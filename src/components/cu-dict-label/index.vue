<template>
  <template v-if="tagType">
    <wd-tag :type="tagType" :round="round">{{ label }}</wd-tag>
  </template>
  <template v-else>
    <view>{{ label }}</view>
  </template>
</template>

<script setup lang="ts">
import { useDictStore } from "@/store/modules/dict";
const dictStore = useDictStore();

const props = defineProps({
  code: String,
  modelValue: [String, Number],
  round: {
    type: Boolean,
    default: false,
  },
});

const label = ref("");
const tagType = ref<string | undefined>();

const getLabelAndTagByValue = async (dictCode: string, value: any) => {
  // 按需加载字典数据
  await dictStore.loadDictItems(dictCode);

  // 从缓存中获取字典数据
  const dictItems = dictStore.getDictItems(dictCode);

  // 查找对应的字典项
  const dictItem = dictItems.find((item) => item.value == value);

  return {
    label: dictItem?.label || "",
    tagType: dictItem?.tagType,
  };
};

// 监听字典数据变化，确保WebSocket更新时刷新标签
watch(
  () => props.code && dictStore.getDictItems(props.code),
  async () => {
    if (props.code) {
      await fetchLabelAndTag();
    }
  },
  { deep: true }
);

// 监听 props 的变化，获取并更新 label 和 tag
const fetchLabelAndTag = async () => {
  if (!props.code || props.modelValue === undefined) return;

  const result = await getLabelAndTagByValue(props.code, props.modelValue);
  label.value = result.label;
  tagType.value = result.tagType;
};

// 首次挂载时获取字典数据
onMounted(fetchLabelAndTag);

// 当 modelValue 发生变化时重新获取
watch(() => props.modelValue, fetchLabelAndTag);
</script>
