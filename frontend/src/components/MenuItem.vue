<template>
  <li class="nav-item">
    <template v-if="menu.children && menu.children.length > 0">
      <div
        class="nav-link"
        :title="computedName"
        @click="handleToggle"
      >
        <span class="icon" aria-hidden="true">{{ getIconLabel(menu.icon) }}</span>
        <span class="nav-text">{{ computedName }}</span>
        <span class="arrow" :class="{ rotated: isExpanded }">▼</span>
      </div>
      <ul v-show="isExpanded" class="submenu">
        <menu-item
          v-for="child in menu.children"
          :key="child.id"
          :menu="child"
          :depth="depth + 1"
          :expanded-menus="expandedMenus"
          @toggle="handleChildToggle"
        />
      </ul>
    </template>

    <template v-else>
      <router-link
        v-if="menu.path"
        :to="menu.path"
        class="nav-link"
        active-class="router-link-active"
        exact-active-class="router-link-active"
        :title="computedName"
      >
        <span class="icon" aria-hidden="true">{{ getIconLabel(menu.icon) }}</span>
        <span class="nav-text">{{ computedName }}</span>
      </router-link>
      <div v-else class="nav-link disabled" :title="computedName">
        <span class="icon" aria-hidden="true">{{ getIconLabel(menu.icon) }}</span>
        <span class="nav-text">{{ computedName }}</span>
      </div>
    </template>
  </li>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    menu: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    expandedMenus: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localExpanded: false
    };
  },
  computed: {
    isExpanded() {
      return this.localExpanded || this.expandedMenus.includes(this.menu.code);
    },
    computedName() {
      if (!this.menu.name) return '';
      return this.menu.name.replace(/^[a-zA-Z0-9_-]+\s*/, '').trim();
    }
  },
  methods: {
    handleToggle() {
      this.localExpanded = !this.localExpanded;
      this.$emit('toggle', this.menu.code, this.localExpanded);
    },
    handleChildToggle(code, expanded) {
      this.$emit('toggle', code, expanded);
    },
    getIconLabel(iconCode) {
      const iconMap = {
        home: '⌂',
        user: '◇',
        team: '◎',
        'file-text': '□',
        file: '▤',
        folder: '▣',
        chart: '↗',
        'bar-chart': '▥',
        brain: '✦',
        settings: '⚙',
        setting: '⚙',
        cog: '⚙',
        bell: '!',
        envelope: '@',
        list: '☰',
        plus: '+',
        edit: '✎',
        trash: '×',
        default: '•'
      };
      return iconMap[iconCode] || iconMap.default;
    }
  }
}
</script>

<style scoped>
.nav-item {
  margin-bottom: 5px;
}

.nav-link {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 12px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0 24px 24px 0;
  margin: 0 10px;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.nav-link.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: transparent;
  transition: all 0.3s ease;
}

.nav-link:hover::before {
  background: var(--accent-color);
}

.nav-link:hover:not(.disabled) {
  background: var(--hover-color);
  transform: translateX(5px);
}

.nav-link.router-link-active {
  background: var(--hover-color);
}

.icon {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  background: rgba(255, 255, 255, 0.1);
}

.arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
  font-size: 0.8rem;
  opacity: 0.7;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.submenu {
  list-style: none;
  padding-left: 36px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 10px 10px;
  margin: 5px 10px 0 10px;
  overflow: hidden;
}

.submenu .nav-link {
  min-height: 40px;
  padding: 8px 12px;
  margin: 2px 5px;
}

.submenu .icon {
  width: 22px;
  height: 22px;
  font-size: 0.85rem;
}

.submenu .nav-link:hover {
  transform: translateX(3px);
}
</style>
