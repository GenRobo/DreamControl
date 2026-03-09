# Hardware deployment of DreamControl


## Setup environment

```shell
conda activate dreamcontrol
```

## (Optional) Generate reference trajectories

Generate reference trajectories for tasks deployable in real-world. We already have generated reference trajectories for the tasks in the [TrajGen/sample/](https://github.com/GenRobo/DreamControl/tree/main/TrajGen/sample) folder. You may skip this step if you want to directly use these generated trajectories for training.

To run trajectory generation for a task, run the following command:

```bash
bash collect_<TASK_NAME>_real.sh
```

TASK_NAME can be one of the following:
```
- Pick
- Button_Press
- Punch
- Open_Drawer
- Squat
- Squat_Open_Drawer
- Bimanual_Pick
```

## (Optional) Train Sim2Real RL policy

Train Sim2Real RL policy for the tasks. The trained policy weights for most tasks are already in the [Sim2Real/deploy/policies/](https://github.com/GenRobo/DreamControl/tree/main/Sim2Real/deploy/policies/) folder. You may skip this step if you want to directly use these trained policies for inference.

```shell
./isaaclab.sh -p scripts/reinforcement_learning/rsl_rl/train.py --task=Isaac-Motion-Tracking-<TASK-NAME>-Real-v0 --headless --device cuda:1
```

TASK_NAME can be one of the following:
```
- Pick
- Pick-UB
- Pick-Top-UB
- Punch
- Punch-UB
- Open-Drawer-UB
- Button-Press-UB
- Squat
- Squat-Open-Drawer
- Bimanual-Pick
```

UB stands for "Upper Body" which means that the policy is trained to only use the upper body to perform the task; the lower body is frozen in training. If there is no UB suffix, the policy is trained to use the whole body to perform the task. For example, ```Pick-UB``` means that the policy is trained to only use the upper body to perform the ```Pick``` task; the lower body is frozen in training. The suffix "-UB" is added to the task name to indicate that the policy is trained to only use the upper body to perform the task.

## (Optional) Inference Sim2Real RL policy

Inference the trained policy for the tasks. The inference results are saved in the [Training/deploy/policies/](https://github.com/GenRobo/DreamControl/tree/main/Sim2Real/deploy/policies) folder.

```bash
./isaaclab.sh -p scripts/reinforcement_learning/rsl_rl/play_eval.py --task=Isaac-Motion-Tracking-<TASK NAME>-Real-v0 --headless --video --num_envs 1000 --device cuda:1 
```

Copy the trained policy weights for the task from the Training/logs/rsl_rl/g1/<TASK FOLDER NAME>/exported/policy.pt folder to the [Sim2Real/deploy/policies/](https://github.com/GenRobo/DreamControl/tree/main/Sim2Real/deploy/policies) folder. Change the name of the file to <TASK NAME>-Real-v0.pt. Please note that the pre-trained weights are already available for all tasks that can be directly deployed on hardware. Copying this file will replace those weights with what you trained

## Run Sim2Real RL policy

### Test on mujoco simulator

Move to deploy/deploy_mujoco folder and run the following command:

```bash
cd Sim2Real/deploy/deploy_mujoco
python deploy_mujoco_<TASK_NAME>.py {config_file}
```

TASK_NAME can be one of the following:
```
- Pick
- Pick_UB
- Pick_Top_UB
- Punch
- Punch_UB
- Open_Drawer_UB
- Button_Press_UB
- Squat
- Squat_Open_Drawer
- Bimanual_Pick
```

- `config_file`: is the configuration file for the task. Use "g1.yaml" for all tasks. Use "g1_full_body.yaml" for full body policies and "g1.yaml" for only upper body policies.

### Test on hardware unitree G1

WARNING and DISCLAIMER: Deploying these models on physical hardware can be hazardous. Unless you have deep sim‑to‑real expertise and robust safety protocols, we strongly advise against running the model on real robots. These models are supplied for research use only, and we disclaim all responsibility for any harm, loss, or malfunction arising from their deployment.

Use an Ethernet cable to connect your computer to the network port on the robot. Modify the network configuration as follows

<img src="https://doc-cdn.unitree.com/static/2023/9/6/0f51cb9b12f94f0cb75070d05118c00a_980x816.jpg" width="400px">

Then use the `ifconfig` command to view the name of the network interface connected to the robot. Record the network interface name, which will be used as a parameter of the startup command later

<img src="https://oss-global-cdn.unitree.com/static/b84485f386994ef08b0ccfa928ab3830_825x484.png" width="400px">

#### Enable inspire hands 

SSH into the unitree G1 robot after turning it on. Please follow the these instructions to install dfx_inspire_service and enable inspire hands: [Link](https://github.com/unitreerobotics/dfx_inspire_service). Once you have dfx_inspire_service installed, run the following on the robot to enable inspire hands control each time you restart the robot:-

```bash
sudo ./inspire_g1
```

#### Mount neck camera

We mount a RealSense D435i camera on the G1 robot's neck, as shown below, to obtain the goal/object pose target for the task. Please 3d print a mount to hold the camera in place on the neck and looking straight ahead, as shown in the picture below. Connect the camera to the device via USB. Follow these instructions to install the realsense SDK and make sure you can get the camera stream by running one of the python examples: [Link](https://dev.realsenseai.com/docs/python2). If you want to use the pre-installed head camera on G1 (or some other camera) instead, necessary changes will need to be made in the LOC_X, LOC_Y amd LOC_Z values in [deploy/deploy_real/deploy_real_base_UB.py](https://github.com/GenRobo/DreamControl/blob/main/Sim2Real/deploy/deploy_real/deploy_real_base_UB.py) and [deploy/deploy_real/deploy_real_base.py](https://github.com/GenRobo/DreamControl/blob/main/Sim2Real/deploy/deploy_real/deploy_real_base.py) files. Also, the code currently assumes that the camera is looking straight ahead. If you want to use the camera at an angle, necessary changes will need to be made in the code. You may also choose to set the target pose of the object/goal in the code manually if you do not want to infer that from the cmaera. 

<img src="https://github.com/GenRobo/DreamControl/blob/main/Sim2Real/neck_camera.png" width="400px">

#### Setup GRID Cortex client

We use GRID Cortex to run OWLv2 foundation model to infer target point. You will need to setup the GRID cortex key to use this functionality. You can get the key by signing up for a free account at [GRID](https://grid.generalrobotics.dev/). After logging in to your account, create a new API key under GRID cortex. Once you have the key, set the CORTEX_API_KEY environment variable as follows for each new terminal you open:-

```bash
export CORTEX_API_KEY=<YOUR_GRID_CORTEX_API_KEY>
```

You can add this to your .bashrc to make it permanent. Install GRID Cortex client in the same environment as the one you are using to run the policies:-

```bash
pip install grid-cortex-client
```

#### Run "only upper body" policies

We use the unitree's arm sdk to control only the upper body while keeping the lower body frozen. The lower body is controlled by unitree to keep the pelvis stable at it's position. The policies for some tasks are trained to only use the upper body to perform the task; the lower body is frozen in training. For example, the policy for ```Pick-UB``` task is trained to only use the upper body to perform the ```Pick``` task; the lower body is frozen in training. However, equivalent full body policies can be trained and deployed on G1 in debug mode as discussed later.

Enter the standing mode by pressing the following buttons sequentially after the robot suspended on gantry is turned on and head blue light stops blinking.

```
1. L2 + Y
2. L2 + B
3. L2 + up arrow -> This will bring the robot to locked standing mode. Lower the gantry such that the robot's feet touch the ground sufficiently
4. R1 + X -> This will bring the robot into walking mode. You can lower the gantry further / unsuspend the gantry (Be extremely cautious)
```

You can now use the joystick to control the robot. Move it to the desired place where you want to run the policy. 

Change the `obj` variable in the header of ``deploy_real_<TASK_NAME>.py`` file to the prompt describing the object/goal specific to the task and is visible in the camera stream. You can set it to "none" and manually set the target pose of the object/goal in TARGET_LOC variable. Run the following command to test the only upper body policy on the robot:

```bash
python deploy_real_<TASK_NAME>.py {net_interface} g1.yaml
```

TASK_NAME can be one of the following:
```
- Pick_UB
- Button_Press_UB
- Punch_UB
- Open_Drawer_UB
- Pick_Top_UB (Pick with top-down grasp)
```

- `net_interface`: is the name of the network interface connected to the robot, such as `enp3s0`. You can use the `ifconfig` command to view the name of the network interface connected to the robot.
- `g1.yaml`: is the configuration file for the robot. You can modify this file to change the parameters of the policy.

For example, to run the only upper body policy for the ```Pick-UB``` task, run the following command:

```bash
python deploy_real_Pick_UB.py enp3s0 g1.yaml
```

When you run the script, it will first get you to `zero torque mode`. In the zero torque state, press the `start` button on the remote control, and the robot will move to the default joint position state. If obj is not set to "none" in the script, it should pop out a window with the object/goal visible in the camera stream. If you see a bounding box around the correct object/goal, you can press the `q` key on the keyboard to close the window. If everything looks good, press the `A` button on the remote control to start the policy. Be extremely careful and monitor the robot's behavior closely. If anything looks wrong at any point, press the `select` button on the remote control to exit the policy and bring the robot back to its default state

#### Run "full body" policies

The full body policies are trained to use the whole body to perform the task. For example, the policy for ```Bimanual-Pick``` task is trained to use the whole body to perform the ```Bimanual-Pick``` task. To run full-body policies, you need to enter debug mode. Follow the following steps to enter debug mode:

```
1. Turn on the robot and the remote control and wait for the head blue light to stop blinking
2. press the `L2+R2` key combination of the remote control; the robot will enter the `debugging mode`, and the robot joints are in the damping state in the `debugging mode`.
```

Make sure, you have enabled inspire hands, mounted the neck camera, connected the camera and the robot as described in the previous sections. Run the following command to test the full body policy on the robot:

```bash
python deploy_real_<TASK_NAME>.py {net_interface} g1_full_body.yaml
```

TASK_NAME can be one of the following:
```
- Bimanual_Pick
- Squat
- Squat_Open_Drawer
- Pick
```

- `net_interface`: is the name of the network interface connected to the robot, such as `enp3s0`. You can use the `ifconfig` command to view the name of the network interface connected to the robot.
- `g1_full_body.yaml`: is the configuration file for the robot. You can modify this file to change the parameters of the policy.

For example, to run the full body policy for the ```Bimanual_Pick``` task, run the following command:

```bash
python deploy_real_Bimanual_Pick.py enp3s0 g1_full_body.yaml
```

When you run the script, it will first get you to `zero torque mode`. In the zero torque state, press the `start` button on the remote control, and the robot will move to the default joint position state. At this point lower the gantry such the the robot's feet touch the ground. Press the `A` button to enter the still standing mode. The robot should stand still and balance itself at this point. Trying giving it a little push and it should balance itself. If anything goes wrong, press the `select` button on the remote control to exit the policy and enter damping mode.

If obj is not set to "none" in the script, it should pop out a window with the object/goal visible in the camera stream. If you see a bounding box around the correct object/goal, you can press the `q` key on the keyboard to close the window. If everything looks good, press the `B` button on the remote control to start the policy. Be extremely careful and monitor the robot's behavior closely. If anything looks wrong at any point, press the `select` button on the remote control to exit the policy and enter damping mode. After the policy is executed the robot will enter damping mode again. You can increase POLICY_TIME variable in the script to longer values to keep the robot in the policy for longer (robot will pause at the end configuration after 10s).
