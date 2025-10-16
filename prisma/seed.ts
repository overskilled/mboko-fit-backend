import { ExerciseCategory, ExperienceLevel, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seeding...');

    // Clear existing data
    await clearDatabase();

    // Create exercises for all muscle groups
    const exercises = await createExercises();
    console.log(`Created ${exercises.length} exercises`);

    // Create workout plans for different levels and goals
    const workoutPlans = await createWorkoutPlans(exercises);
    console.log(`Created ${workoutPlans.length} workout plans`);

    console.log('Database seeding completed successfully!');
}

async function clearDatabase() {
    const tablenames = await prisma.$queryRaw<
        Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tablenames) {
        if (tablename !== '_prisma_migrations') {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
            } catch (error) {
                console.log({ error });
            }
        }
    }
}

async function createExercises() {
    const exercisesData = [
        // LEG EXERCISES
        {
            name: 'Fante Arriéré',
            slug: 'fante-arriere',
            description: 'Backward lunge targeting glutes and hamstrings',
            category: 'STRENGTH',
            muscleGroups: ['glutes', 'hamstrings', 'quadriceps'],
            equipment: 'Bodyweight',
            videoUrl: 'https://example.com/videos/backward-lunge',
            instructions: [
                'Stand with feet hip-width apart',
                'Step backward with one leg',
                'Lower hips until both knees are bent at 90-degree angles',
                'Push through front heel to return to starting position',
                'Alternate legs for each repetition'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Goblet Squat',
            slug: 'goblet-squat',
            description: 'Front-loaded squat perfect for beginners',
            category: 'STRENGTH',
            muscleGroups: ['quadriceps', 'glutes', 'core'],
            equipment: 'Dumbbell, Kettlebell',
            videoUrl: 'https://example.com/videos/goblet-squat',
            instructions: [
                'Hold dumbbell vertically against chest with both hands',
                'Stand with feet shoulder-width apart',
                'Lower into squat position, keeping chest up',
                'Descend until elbows touch inside of knees',
                'Drive through heels to return to standing'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Soulever de Terre avec Haltères',
            slug: 'dumbbell-deadlift',
            description: 'Dumbbell deadlift for posterior chain development',
            category: 'STRENGTH',
            muscleGroups: ['hamstrings', 'glutes', 'lower-back'],
            equipment: 'Dumbbells',
            videoUrl: 'https://example.com/videos/dumbbell-deadlift',
            instructions: [
                'Stand with feet hip-width apart, dumbbells in front',
                'Hinge at hips while keeping back straight',
                'Lower dumbbells along shins',
                'Squeeze glutes to return to standing position',
                'Keep core tight throughout movement'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Jump Squat',
            slug: 'jump-squat',
            description: 'Plyometric exercise for power development',
            category: 'STRENGTH',
            muscleGroups: ['quadriceps', 'glutes', 'calves'],
            equipment: 'Bodyweight',
            videoUrl: 'https://example.com/videos/jump-squat',
            instructions: [
                'Start in squat position',
                'Explosively jump as high as possible',
                'Land softly with knees bent',
                'Immediately go into next repetition',
                'Maintain controlled breathing'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Sumo Squat',
            slug: 'sumo-squat',
            description: 'Wide-stance squat targeting inner thighs',
            category: 'STRENGTH',
            muscleGroups: ['quadriceps', 'adductors', 'glutes'],
            equipment: 'Dumbbell, Kettlebell',
            videoUrl: 'https://example.com/videos/sumo-squat',
            instructions: [
                'Take wide stance with toes pointed out',
                'Hold weight with both hands between legs',
                'Lower into squat, keeping knees aligned with toes',
                'Go as deep as flexibility allows',
                'Drive through heels to return up'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Squat Bulgare',
            slug: 'bulgarian-split-squat',
            description: 'Single-leg squat variation for leg development',
            category: 'STRENGTH',
            muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
            equipment: 'Dumbbells, Bench',
            videoUrl: 'https://example.com/videos/bulgarian-squat',
            instructions: [
                'Place back foot on bench behind you',
                'Hold dumbbells in each hand',
                'Lower until front thigh is parallel to ground',
                'Keep front knee behind toes',
                'Push through front foot to return'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Barbell Squat',
            slug: 'barbell-squat',
            description: 'Fundamental lower body compound movement',
            category: 'STRENGTH',
            muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
            equipment: 'Barbell, Squat Rack',
            videoUrl: 'https://example.com/videos/barbell-squat',
            instructions: [
                'Position barbell on upper back',
                'Stand with feet shoulder-width apart',
                'Break at hips and knees simultaneously',
                'Lower until thighs are parallel to ground',
                'Drive through entire foot to stand'
            ],
            defaultSets: 4,
            defaultReps: 8,
        },
        {
            name: 'Barbell Deadlift',
            slug: 'barbell-deadlift',
            description: 'Full-body strength builder',
            category: 'STRENGTH',
            muscleGroups: ['hamstrings', 'glutes', 'back', 'core'],
            equipment: 'Barbell',
            videoUrl: 'https://example.com/videos/barbell-deadlift',
            instructions: [
                'Stand with feet hip-width apart, bar over mid-foot',
                'Bend to grip bar just outside knees',
                'Keep chest up and back straight',
                'Stand up by extending hips and knees',
                'Lower bar with control'
            ],
            defaultSets: 4,
            defaultReps: 6,
        },
        {
            name: 'Barbell Back Lunges',
            slug: 'barbell-back-lunges',
            description: 'Advanced lunge variation with barbell',
            category: 'STRENGTH',
            muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
            equipment: 'Barbell',
            videoUrl: 'https://example.com/videos/barbell-lunges',
            instructions: [
                'Position barbell on upper back',
                'Step backward into lunge position',
                'Lower until both knees form 90-degree angles',
                'Push through front foot to return',
                'Maintain upright torso throughout'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Front Squat',
            slug: 'front-squat',
            description: 'Quad-dominant squat variation',
            category: 'STRENGTH',
            muscleGroups: ['quadriceps', 'core', 'upper-back'],
            equipment: 'Barbell',
            videoUrl: 'https://example.com/videos/front-squat',
            instructions: [
                'Rest barbell on front shoulders',
                'Keep elbows high and chest up',
                'Descend into squat position',
                'Maintain upright torso',
                'Drive through heels to stand'
            ],
            defaultSets: 4,
            defaultReps: 8,
        },
        {
            name: 'Lunges Deadlift',
            slug: 'lunges-deadlift',
            description: 'Combination movement for full leg development',
            category: 'STRENGTH',
            muscleGroups: ['hamstrings', 'glutes', 'quadriceps'],
            equipment: 'Dumbbells',
            videoUrl: 'https://example.com/videos/lunge-deadlift',
            instructions: [
                'Hold dumbbells in each hand',
                'Step forward into lunge position',
                'As you return, hinge into deadlift',
                'Alternate between lunge and deadlift',
                'Maintain core stability throughout'
            ],
            defaultSets: 4,
            defaultReps: 10,
        },

        // BACK EXERCISES
        {
            name: 'Traction Australienne en Tuck Prise Pronation',
            slug: 'australian-pullup-tuck',
            description: 'Bodyweight row variation for back development',
            category: 'STRENGTH',
            muscleGroups: ['back', 'biceps', 'rear-delts'],
            equipment: 'Barbell, Smith Machine',
            videoUrl: 'https://example.com/videos/australian-pullup',
            instructions: [
                'Set bar at waist height',
                'Lie underneath bar with knees bent',
                'Grip bar with palms facing away',
                'Pull chest to bar while keeping body straight',
                'Lower with control'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Tirage Horizontal Prise Supination',
            slug: 'seated-row-supination',
            description: 'Machine row with underhand grip',
            category: 'STRENGTH',
            muscleGroups: ['back', 'biceps', 'rhomboids'],
            equipment: 'Cable Machine',
            videoUrl: 'https://example.com/videos/seated-row',
            instructions: [
                'Sit with chest against pad',
                'Use underhand grip on handle',
                'Pull handle to lower chest',
                'Squeeze shoulder blades together',
                'Return with controlled motion'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Tirage Verticale à la Poulie',
            slug: 'lat-pulldown',
            description: 'Fundamental back width builder',
            category: 'STRENGTH',
            muscleGroups: ['lats', 'biceps', 'back'],
            equipment: 'Cable Machine',
            videoUrl: 'https://example.com/videos/lat-pulldown',
            instructions: [
                'Sit with thighs secured under pads',
                'Grip bar wider than shoulder width',
                'Pull bar to upper chest',
                'Lean back slightly',
                'Focus on lat engagement'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Rowing avec Haltères Bras Alternés',
            slug: 'dumbbell-row-alternating',
            description: 'Unilateral row for balanced development',
            category: 'STRENGTH',
            muscleGroups: ['lats', 'rhomboids', 'biceps'],
            equipment: 'Dumbbells, Bench',
            videoUrl: 'https://example.com/videos/dumbbell-row',
            instructions: [
                'Place knee and hand on bench',
                'Keep back flat and parallel to ground',
                'Row dumbbell to hip',
                'Squeeze shoulder blade at top',
                'Alternate arms each repetition'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Traction Pronation Prise Large',
            slug: 'wide-grip-pullup',
            description: 'Advanced bodyweight back exercise',
            category: 'STRENGTH',
            muscleGroups: ['lats', 'back', 'biceps'],
            equipment: 'Pull-up Bar',
            videoUrl: 'https://example.com/videos/wide-pullup',
            instructions: [
                'Grip bar wider than shoulder width',
                'Hang with arms fully extended',
                'Pull chest to bar',
                'Lower with full control',
                'Maintain strict form'
            ],
            defaultSets: 4,
            defaultReps: 8,
        },
        {
            name: 'Pull Over',
            slug: 'pull-over',
            description: 'Chest and back stretching movement',
            category: 'STRENGTH',
            muscleGroups: ['lats', 'chest', 'triceps'],
            equipment: 'Dumbbell, Bench',
            videoUrl: 'https://example.com/videos/pullover',
            instructions: [
                'Lie perpendicular on bench',
                'Hold dumbbell with both hands overhead',
                'Lower dumbbell behind head',
                'Feel stretch in lats and chest',
                'Return to starting position'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },

        // CHEST EXERCISES
        {
            name: 'Pompe Standard',
            slug: 'standard-pushup',
            description: 'Fundamental bodyweight chest exercise',
            category: 'STRENGTH',
            muscleGroups: ['chest', 'triceps', 'shoulders'],
            equipment: 'Bodyweight',
            videoUrl: 'https://example.com/videos/pushup',
            instructions: [
                'Place hands slightly wider than shoulders',
                'Keep body in straight line',
                'Lower chest to ground',
                'Push back to starting position',
                'Maintain core tension'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Pompe Diamant sur Genoux',
            slug: 'diamond-knee-pushup',
            description: 'Triceps-focused pushup variation',
            category: 'STRENGTH',
            muscleGroups: ['triceps', 'chest'],
            equipment: 'Bodyweight',
            videoUrl: 'https://example.com/videos/diamond-pushup',
            instructions: [
                'Form diamond shape with hands',
                'Keep knees on ground for support',
                'Lower chest to hands',
                'Focus on triceps engagement',
                'Maintain straight back'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Développé Couché aux Haltères',
            slug: 'dumbbell-bench-press',
            description: 'Free weight chest press',
            category: 'STRENGTH',
            muscleGroups: ['chest', 'triceps', 'shoulders'],
            equipment: 'Dumbbells, Bench',
            videoUrl: 'https://example.com/videos/dumbbell-press',
            instructions: [
                'Lie on bench with feet flat',
                'Press dumbbells from chest to overhead',
                'Keep wrists straight',
                'Lower with control',
                'Touch dumbbells at chest bottom'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Écarté aux Haltères',
            slug: 'dumbbell-fly',
            description: 'Chest isolation movement',
            category: 'STRENGTH',
            muscleGroups: ['chest'],
            equipment: 'Dumbbells, Bench',
            videoUrl: 'https://example.com/videos/dumbbell-fly',
            instructions: [
                'Lie on bench with dumbbells overhead',
                'Maintain slight bend in elbows',
                'Lower dumbbells in arc motion',
                'Feel chest stretch at bottom',
                'Return along same path'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Développé Couché à la Barre',
            slug: 'barbell-bench-press',
            description: 'Classic chest strength builder',
            category: 'STRENGTH',
            muscleGroups: ['chest', 'triceps', 'shoulders'],
            equipment: 'Barbell, Bench',
            videoUrl: 'https://example.com/videos/barbell-bench',
            instructions: [
                'Lie on bench with arch in back',
                'Grip bar slightly wider than shoulders',
                'Lower bar to mid-chest',
                'Press bar to starting position',
                'Keep shoulder blades retracted'
            ],
            defaultSets: 4,
            defaultReps: 8,
        },
        {
            name: 'Fly à la Poulie',
            slug: 'cable-fly',
            description: 'Constant tension chest exercise',
            category: 'STRENGTH',
            muscleGroups: ['chest'],
            equipment: 'Cable Machine',
            videoUrl: 'https://example.com/videos/cable-fly',
            instructions: [
                'Set pulleys at shoulder height',
                'Step forward with one foot',
                'Bring handles together in front',
                'Squeeze chest at peak contraction',
                'Return with controlled motion'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },

        // SHOULDER EXERCISES
        {
            name: 'Développé Militaire avec Haltères',
            slug: 'dumbbell-shoulder-press',
            description: 'Shoulder press with dumbbells',
            category: 'STRENGTH',
            muscleGroups: ['shoulders', 'triceps'],
            equipment: 'Dumbbells',
            videoUrl: 'https://example.com/videos/dumbbell-press',
            instructions: [
                'Sit on bench with back support',
                'Press dumbbells overhead',
                'Lower to shoulder level',
                'Keep palms facing forward',
                'Avoid arching back'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Élévation Latérale aux Haltères',
            slug: 'dumbbell-lateral-raise',
            description: 'Side delt isolation',
            category: 'STRENGTH',
            muscleGroups: ['shoulders'],
            equipment: 'Dumbbells',
            videoUrl: 'https://example.com/videos/lateral-raise',
            instructions: [
                'Stand with dumbbells at sides',
                'Raise arms to shoulder height',
                'Keep slight bend in elbows',
                'Lower with control',
                'Focus on delt contraction'
            ],
            defaultSets: 4,
            defaultReps: 15,
        },
        {
            name: 'Oiseau Assis sur le Banc',
            slug: 'bent-over-rear-delt-fly',
            description: 'Rear delt development',
            category: 'STRENGTH',
            muscleGroups: ['rear-shoulders', 'back'],
            equipment: 'Dumbbells, Bench',
            videoUrl: 'https://example.com/videos/rear-delt-fly',
            instructions: [
                'Sit on edge of bench, lean forward',
                'Hold dumbbells below knees',
                'Raise arms to sides',
                'Squeeze rear delts at top',
                'Maintain flat back'
            ],
            defaultSets: 4,
            defaultReps: 15,
        },
        {
            name: 'Tirage Menton Barre',
            slug: 'upright-row',
            description: 'Shoulder and trap developer',
            category: 'STRENGTH',
            muscleGroups: ['shoulders', 'traps'],
            equipment: 'Barbell',
            videoUrl: 'https://example.com/videos/upright-row',
            instructions: [
                'Grip bar with narrow grip',
                'Pull bar to chin height',
                'Keep elbows high',
                'Lower with control',
                'Avoid shrugging excessively'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Face Pull',
            slug: 'face-pull',
            description: 'Posture correction exercise',
            category: 'STRENGTH',
            muscleGroups: ['rear-shoulders', 'traps'],
            equipment: 'Cable Machine',
            videoUrl: 'https://example.com/videos/face-pull',
            instructions: [
                'Set pulley at face height',
                'Use rope attachment',
                'Pull towards face',
                'External rotate at end',
                'Squeeze rear delts'
            ],
            defaultSets: 4,
            defaultReps: 15,
        },

        // ARM EXERCISES
        {
            name: 'Curl Biceps Prise Neutre aux Haltères',
            slug: 'hammer-curl',
            description: 'Brachialis and forearm developer',
            category: 'STRENGTH',
            muscleGroups: ['biceps', 'forearms'],
            equipment: 'Dumbbells',
            videoUrl: 'https://example.com/videos/hammer-curl',
            instructions: [
                'Stand with palms facing body',
                'Curl dumbbells to shoulders',
                'Keep elbows at sides',
                'Lower with control',
                'Avoid swinging body'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Curl Pupitre à la Barre EZ',
            slug: 'preacher-curl',
            description: 'Biceps isolation exercise',
            category: 'STRENGTH',
            muscleGroups: ['biceps'],
            equipment: 'EZ Bar, Preacher Bench',
            videoUrl: 'https://example.com/videos/preacher-curl',
            instructions: [
                'Sit at preacher bench',
                'Rest arms on pad',
                'Curl bar to shoulder height',
                'Lower with full extension',
                'Maintain controlled tempo'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Dips sur le Banc',
            slug: 'bench-dips',
            description: 'Bodyweight triceps exercise',
            category: 'STRENGTH',
            muscleGroups: ['triceps', 'chest'],
            equipment: 'Bench, Bodyweight',
            videoUrl: 'https://example.com/videos/bench-dips',
            instructions: [
                'Place hands on bench behind you',
                'Keep legs straight or bent',
                'Lower body by bending elbows',
                'Push back to starting position',
                'Keep shoulders away from ears'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Extension Verticale à la Poulie Haute',
            slug: 'triceps-pushdown',
            description: 'Triceps isolation movement',
            category: 'STRENGTH',
            muscleGroups: ['triceps'],
            equipment: 'Cable Machine',
            videoUrl: 'https://example.com/videos/triceps-pushdown',
            instructions: [
                'Stand facing cable machine',
                'Grip bar with palms down',
                'Push bar to full extension',
                'Keep elbows at sides',
                'Return with control'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },
        {
            name: 'Barre Front à la Barre EZ',
            slug: 'skull-crusher',
            description: 'Triceps mass builder',
            category: 'STRENGTH',
            muscleGroups: ['triceps'],
            equipment: 'EZ Bar, Bench',
            videoUrl: 'https://example.com/videos/skull-crusher',
            instructions: [
                'Lie on bench with bar overhead',
                'Lower bar towards forehead',
                'Keep elbows stationary',
                'Extend arms to starting position',
                'Maintain controlled movement'
            ],
            defaultSets: 4,
            defaultReps: 12,
        },

        // ABS EXERCISES
        {
            name: 'Dead Bug',
            slug: 'dead-bug',
            description: 'Core stability exercise',
            category: 'STRENGTH',
            muscleGroups: ['abs', 'core'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/dead-bug',
            instructions: [
                'Lie on back with arms and legs up',
                'Simultaneously lower opposite arm and leg',
                'Keep lower back pressed to floor',
                'Return to starting position',
                'Maintain controlled breathing'
            ],
            defaultSets: 3,
            defaultReps: 15,
        },
        {
            name: 'Russian Twist',
            slug: 'russian-twist',
            description: 'Oblique and rotational core work',
            category: 'STRENGTH',
            muscleGroups: ['obliques', 'abs'],
            equipment: 'Mat, Medicine Ball (optional)',
            videoUrl: 'https://example.com/videos/russian-twist',
            instructions: [
                'Sit with knees bent and lean back',
                'Rotate torso from side to side',
                'Keep chest up and back straight',
                'Touch ground on each side',
                'Maintain core tension'
            ],
            defaultSets: 3,
            defaultReps: 20,
        },
        {
            name: 'Bicycle Crunch',
            slug: 'bicycle-crunch',
            description: 'Dynamic core exercise',
            category: 'STRENGTH',
            muscleGroups: ['abs', 'obliques'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/bicycle-crunch',
            instructions: [
                'Lie on back with hands behind head',
                'Bring opposite elbow to knee',
                'Alternate sides in pedaling motion',
                'Keep lower back pressed down',
                'Maintain steady rhythm'
            ],
            defaultSets: 3,
            defaultReps: 30,
        },
        {
            name: 'Mountain Climber',
            slug: 'mountain-climber',
            description: 'Cardio and core combination',
            category: 'CARDIO',
            muscleGroups: ['core', 'shoulders', 'legs'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/mountain-climber',
            instructions: [
                'Start in plank position',
                'Bring knee to chest alternately',
                'Maintain straight back',
                'Increase speed for intensity',
                'Keep hips stable'
            ],
            defaultSets: 3,
            defaultReps: 30,
        },
        {
            name: 'Flutter Kicks',
            slug: 'flutter-kicks',
            description: 'Lower abs and hip flexor exercise',
            category: 'STRENGTH',
            muscleGroups: ['lower-abs', 'hip-flexors'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/flutter-kicks',
            instructions: [
                'Lie on back with legs extended',
                'Lift legs slightly off ground',
                'Alternate kicking motion',
                'Keep lower back pressed down',
                'Maintain small, controlled movements'
            ],
            defaultSets: 3,
            defaultReps: 30,
        },
        {
            name: 'Crunch',
            slug: 'crunch',
            description: 'Basic abdominal exercise',
            category: 'STRENGTH',
            muscleGroups: ['abs'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/crunch',
            instructions: [
                'Lie on back with knees bent',
                'Place hands behind head',
                'Lift shoulder blades off ground',
                'Contract abs at top',
                'Lower with control'
            ],
            defaultSets: 3,
            defaultReps: 20,
        },
        {
            name: 'Elbow Plank',
            slug: 'elbow-plank',
            description: 'Core stability hold',
            category: 'STRENGTH',
            muscleGroups: ['core', 'abs', 'shoulders'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/plank',
            instructions: [
                'Support body on forearms and toes',
                'Keep body in straight line',
                'Engage core and glutes',
                'Hold for time',
                'Maintain even breathing'
            ],
            defaultSets: 3,
            defaultReps: 1, // This will be timed
        },

        // FLEXIBILITY & MOBILITY EXERCISES
        {
            name: 'Cat-Cow Stretch',
            slug: 'cat-cow-stretch',
            description: 'Spinal flexibility movement',
            category: 'FLEXIBILITY',
            muscleGroups: ['back', 'core'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/cat-cow',
            instructions: [
                'Start on hands and knees',
                'Arch back upward (cat)',
                'Drop belly downward (cow)',
                'Move with breath',
                'Repeat fluidly'
            ],
            defaultSets: 3,
            defaultReps: 10,
        },
        {
            name: 'Pigeon Pose',
            slug: 'pigeon-pose',
            description: 'Hip opener stretch',
            category: 'FLEXIBILITY',
            muscleGroups: ['hips', 'glutes'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/pigeon-pose',
            instructions: [
                'From downward dog, bring knee to wrist',
                'Extend back leg straight',
                'Keep hips square',
                'Hold for 30-60 seconds',
                'Breathe deeply into stretch'
            ],
            defaultSets: 1,
            defaultReps: 1,
        },
        {
            name: 'World\'s Greatest Stretch',
            slug: 'worlds-greatest-stretch',
            description: 'Full body dynamic mobility',
            category: 'FLEXIBILITY',
            muscleGroups: ['hips', 'hamstrings', 'thoracic'],
            equipment: 'Mat',
            videoUrl: 'https://example.com/videos/worlds-greatest-stretch',
            instructions: [
                'Step forward into lunge',
                'Place opposite hand on ground',
                'Rotate torso upward',
                'Hold for breath',
                'Alternate sides'
            ],
            defaultSets: 2,
            defaultReps: 8,
        },
        {
            name: 'Thoracic Bridge',
            slug: 'thoracic-bridge',
            description: 'Upper back mobility exercise',
            category: 'FLEXIBILITY',
            muscleGroups: ['upper-back', 'shoulders'],
            equipment: 'Mat, Foam Roller',
            videoUrl: 'https://example.com/videos/thoracic-bridge',
            instructions: [
                'Lie with foam roller under upper back',
                'Support head with hands',
                'Bridge hips upward',
                'Roll gently along upper back',
                'Breathe into tight areas'
            ],
            defaultSets: 2,
            defaultReps: 10,
        }
    ];

    const exercises: any = [];
    for (const exerciseData of exercisesData) {
        const exercise = await prisma.exercise.create({
            data: { ...exerciseData, category: exerciseData.category as ExerciseCategory },
        });
        exercises.push(exercise);
    }

    return exercises;
}

async function createWorkoutPlans(exercises: any[]) {
    const workoutPlansData = [
        // LEG DAY PLANS
        {
            title: 'MbokoFit Leg Day - Beginner',
            slug: 'mbokofit-leg-beginner',
            description: 'Perfect introduction to leg training with proper form focus',
            level: 'BEGINNER',
            durationWeeks: 8,
            isPublic: true,
        },
        {
            title: 'MbokoFit Leg Day - Intermediate',
            slug: 'mbokofit-leg-intermediate',
            description: 'Progressive leg training for continued development',
            level: 'INTERMEDIATE',
            durationWeeks: 10,
            isPublic: true,
        },
        {
            title: 'MbokoFit Leg Day - Advanced',
            slug: 'mbokofit-leg-advanced',
            description: 'Advanced leg programming for experienced lifters',
            level: 'ADVANCED',
            durationWeeks: 12,
            isPublic: true,
        },

        // BACK DAY PLANS
        {
            title: 'MbokoFit Back Day - Beginner',
            slug: 'mbokofit-back-beginner',
            description: 'Build a strong, developed back with proper technique',
            level: 'BEGINNER',
            durationWeeks: 8,
            isPublic: true,
        },
        {
            title: 'MbokoFit Back Day - Intermediate',
            slug: 'mbokofit-back-intermediate',
            description: 'Intermediate back training for width and thickness',
            level: 'INTERMEDIATE',
            durationWeeks: 10,
            isPublic: true,
        },
        {
            title: 'MbokoFit Back Day - Advanced',
            slug: 'mbokofit-back-advanced',
            description: 'Advanced back specialization program',
            level: 'ADVANCED',
            durationWeeks: 12,
            isPublic: true,
        },

        // CHEST DAY PLANS
        {
            title: 'MbokoFit Chest Day - Beginner',
            slug: 'mbokofit-chest-beginner',
            description: 'Fundamental chest development program',
            level: 'BEGINNER',
            durationWeeks: 8,
            isPublic: true,
        },
        {
            title: 'MbokoFit Chest Day - Intermediate',
            slug: 'mbokofit-chest-intermediate',
            description: 'Intermediate chest training for mass and strength',
            level: 'INTERMEDIATE',
            durationWeeks: 10,
            isPublic: true,
        },
        {
            title: 'MbokoFit Chest Day - Advanced',
            slug: 'mbokofit-chest-advanced',
            description: 'Advanced chest specialization program',
            level: 'ADVANCED',
            durationWeeks: 12,
            isPublic: true,
        },

        // SHOULDER DAY PLANS
        {
            title: 'MbokoFit Shoulder Day - Beginner',
            slug: 'mbokofit-shoulder-beginner',
            description: 'Build strong, balanced shoulders',
            level: 'BEGINNER',
            durationWeeks: 8,
            isPublic: true,
        },
        {
            title: 'MbokoFit Shoulder Day - Intermediate',
            slug: 'mbokofit-shoulder-intermediate',
            description: 'Intermediate shoulder development program',
            level: 'INTERMEDIATE',
            durationWeeks: 10,
            isPublic: true,
        },
        {
            title: 'MbokoFit Shoulder Day - Advanced',
            slug: 'mbokofit-shoulder-advanced',
            description: 'Advanced shoulder specialization',
            level: 'ADVANCED',
            durationWeeks: 12,
            isPublic: true,
        },

        // ARM DAY PLANS
        {
            title: 'MbokoFit Arm Day - Beginner',
            slug: 'mbokofit-arm-beginner',
            description: 'Balanced arm development program',
            level: 'BEGINNER',
            durationWeeks: 8,
            isPublic: true,
        },
        {
            title: 'MbokoFit Arm Day - Intermediate',
            slug: 'mbokofit-arm-intermediate',
            description: 'Intermediate arm training for size and definition',
            level: 'INTERMEDIATE',
            durationWeeks: 10,
            isPublic: true,
        },
        {
            title: 'MbokoFit Arm Day - Advanced',
            slug: 'mbokofit-arm-advanced',
            description: 'Advanced arm specialization program',
            level: 'ADVANCED',
            durationWeeks: 12,
            isPublic: true,
        },

        // ADDITIONAL PROGRAMS
        {
            title: 'Full Body Flexibility Program',
            slug: 'flexibility-program',
            description: 'Improve mobility and range of motion',
            level: 'BEGINNER',
            durationWeeks: 6,
            isPublic: true,
        },
        {
            title: 'Core Strength & Stability',
            slug: 'core-strength-program',
            description: 'Develop strong, functional core muscles',
            level: 'INTERMEDIATE',
            durationWeeks: 8,
            isPublic: true,
        },
        {
            title: 'Functional Mobility Training',
            slug: 'mobility-training',
            description: 'Enhance movement quality and joint health',
            level: 'BEGINNER',
            durationWeeks: 4,
            isPublic: true,
        }
    ];

    const workoutPlans: any = [];

    // Helper function to find exercises by slug
    const findExercise = (slug: string) => exercises.find(e => e.slug === slug);

    for (const planData of workoutPlansData) {
        const workoutPlan = await prisma.workoutPlan.create({
            data: { ...planData, level: planData.level as ExperienceLevel },
        });

        // Create plan workouts based on the program type
        if (planData.slug.includes('leg-beginner')) {
            // LEG DAY - BEGINNER
            const legDay = await prisma.planWorkout.create({
                data: {
                    name: 'Leg Day - Beginner',
                    weekNumber: 1,
                    dayOfWeek: 1,
                    order: 1,
                    planId: workoutPlan.id,
                    notes: 'Focus on proper form and controlled movements. Rest 60-90 seconds between sets.',
                },
            });

            const beginnerLegExercises = [
                { exercise: findExercise('fante-arriere'), sets: 4, reps: 12 },
                { exercise: findExercise('goblet-squat'), sets: 4, reps: 12 },
                { exercise: findExercise('dumbbell-deadlift'), sets: 4, reps: 12 },
                { exercise: findExercise('jump-squat'), sets: 4, reps: 12 },
            ];

            for (let i = 0; i < beginnerLegExercises.length; i++) {
                if (beginnerLegExercises[i].exercise) {
                    await prisma.planWorkoutExercise.create({
                        data: {
                            planWorkoutId: legDay.id,
                            exerciseId: beginnerLegExercises[i].exercise.id,
                            sets: beginnerLegExercises[i].sets,
                            reps: beginnerLegExercises[i].reps,
                            order: i + 1,
                            metadata: {
                                rest: 80, // 1:20 rest
                                tempo: '2010',
                                notes: 'Focus on proper form'
                            },
                        },
                    });
                }
            }

        } else if (planData.slug.includes('leg-intermediate')) {
            // LEG DAY - INTERMEDIATE
            const legDay = await prisma.planWorkout.create({
                data: {
                    name: 'Leg Day - Intermediate',
                    weekNumber: 1,
                    dayOfWeek: 1,
                    order: 1,
                    planId: workoutPlan.id,
                    notes: 'Increase intensity while maintaining good form. Rest 90-120 seconds between sets.',
                },
            });

            const intermediateLegExercises = [
                { exercise: findExercise('sumo-squat'), sets: 4, reps: 12 },
                { exercise: findExercise('bulgarian-split-squat'), sets: 4, reps: 12 },
                { exercise: findExercise('barbell-squat'), sets: 4, reps: 8 },
                { exercise: findExercise('barbell-deadlift'), sets: 4, reps: 6 },
            ];

            for (let i = 0; i < intermediateLegExercises.length; i++) {
                if (intermediateLegExercises[i].exercise) {
                    await prisma.planWorkoutExercise.create({
                        data: {
                            planWorkoutId: legDay.id,
                            exerciseId: intermediateLegExercises[i].exercise.id,
                            sets: intermediateLegExercises[i].sets,
                            reps: intermediateLegExercises[i].reps,
                            order: i + 1,
                            metadata: {
                                rest: 80,
                                tempo: '3010',
                                notes: 'Progressive overload focus'
                            },
                        },
                    });
                }
            }

        } else if (planData.slug.includes('leg-advanced')) {
            // LEG DAY - ADVANCED
            const legDay = await prisma.planWorkout.create({
                data: {
                    name: 'Leg Day - Advanced',
                    weekNumber: 1,
                    dayOfWeek: 1,
                    order: 1,
                    planId: workoutPlan.id,
                    notes: 'High intensity leg training. Use proper warm-up and recovery protocols.',
                },
            });

            const advancedLegExercises = [
                { exercise: findExercise('barbell-back-lunges'), sets: 4, reps: 12 },
                { exercise: findExercise('front-squat'), sets: 4, reps: 8 },
                { exercise: findExercise('lunge-deadlift'), sets: 4, reps: 10 },
                { exercise: findExercise('barbell-deadlift'), sets: 4, reps: 6 },
            ];

            for (let i = 0; i < advancedLegExercises.length; i++) {
                if (advancedLegExercises[i].exercise) {
                    await prisma.planWorkoutExercise.create({
                        data: {
                            planWorkoutId: legDay.id,
                            exerciseId: advancedLegExercises[i].exercise.id,
                            sets: advancedLegExercises[i].sets,
                            reps: advancedLegExercises[i].reps,
                            order: i + 1,
                            metadata: {
                                rest: 80,
                                tempo: '3110',
                                notes: 'Advanced techniques allowed'
                            },
                        },
                    });
                }
            }

        } else if (planData.slug.includes('flexibility')) {
            // FLEXIBILITY PROGRAM
            const flexibilityWorkout = await prisma.planWorkout.create({
                data: {
                    name: 'Full Body Flexibility',
                    weekNumber: 1,
                    dayOfWeek: 1,
                    order: 1,
                    planId: workoutPlan.id,
                    notes: 'Perform daily. Hold stretches for 30-60 seconds. Breathe deeply.',
                },
            });

            const flexibilityExercises = [
                { exercise: findExercise('cat-cow-stretch'), sets: 3, reps: 10 },
                { exercise: findExercise('pigeon-pose'), sets: 1, reps: 1 },
                { exercise: findExercise('worlds-greatest-stretch'), sets: 2, reps: 8 },
                { exercise: findExercise('thoracic-bridge'), sets: 2, reps: 10 },
            ];

            for (let i = 0; i < flexibilityExercises.length; i++) {
                if (flexibilityExercises[i].exercise) {
                    await prisma.planWorkoutExercise.create({
                        data: {
                            planWorkoutId: flexibilityWorkout.id,
                            exerciseId: flexibilityExercises[i].exercise.id,
                            sets: flexibilityExercises[i].sets,
                            reps: flexibilityExercises[i].reps,
                            order: i + 1,
                            metadata: {
                                rest: 0,
                                hold: 30, // seconds to hold
                                notes: 'Focus on deep breathing'
                            },
                        },
                    });
                }
            }

        } else if (planData.slug.includes('core-strength')) {
            // CORE STRENGTH PROGRAM
            const coreWorkout = await prisma.planWorkout.create({
                data: {
                    name: 'Core Strength Circuit',
                    weekNumber: 1,
                    dayOfWeek: 1,
                    order: 1,
                    planId: workoutPlan.id,
                    notes: 'Perform 3-4 times per week. Minimal rest between exercises.',
                },
            });

            const coreExercises = [
                { exercise: findExercise('dead-bug'), sets: 3, reps: 15 },
                { exercise: findExercise('russian-twist'), sets: 3, reps: 20 },
                { exercise: findExercise('bicycle-crunch'), sets: 3, reps: 30 },
                { exercise: findExercise('mountain-climber'), sets: 3, reps: 30 },
                { exercise: findExercise('flutter-kicks'), sets: 3, reps: 30 },
                { exercise: findExercise('elbow-plank'), sets: 3, reps: 1 },
            ];

            for (let i = 0; i < coreExercises.length; i++) {
                if (coreExercises[i].exercise) {
                    await prisma.planWorkoutExercise.create({
                        data: {
                            planWorkoutId: coreWorkout.id,
                            exerciseId: coreExercises[i].exercise.id,
                            sets: coreExercises[i].sets,
                            reps: coreExercises[i].reps,
                            order: i + 1,
                            metadata: {
                                rest: 30,
                                tempo: coreExercises[i].exercise.slug === 'elbow-plank' ? 'hold' : 'controlled',
                                notes: coreExercises[i].exercise.slug === 'elbow-plank' ? 'Hold for 30-60 seconds' : 'Controlled movements'
                            },
                        },
                    });
                }
            }
        }

        // Add multiple weeks for longer programs
        if (planData.durationWeeks && planData.durationWeeks > 1) {
            for (let week = 2; week <= planData.durationWeeks; week++) {
                await prisma.planWorkout.create({
                    data: {
                        name: `Week ${week}`,
                        weekNumber: week,
                        dayOfWeek: 1,
                        order: week,
                        planId: workoutPlan.id,
                        notes: `Progressive overload - aim to increase weight or reps slightly from previous week.`,
                    },
                });
            }
        }

        workoutPlans.push(workoutPlan);
    }

    return workoutPlans;
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });